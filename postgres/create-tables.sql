--Initial tables creation at docker-compose

--DROP DATABASE IF EXISTS prism-db;


\c prism-db;

CREATE TABLE IF NOT EXISTS users (
	userId		SERIAL PRIMARY KEY,
	userName 	TEXT UNIQUE,
	password	TEXT,
	firstName	TEXT,
	lastName	TEXT,
	country		TEXT,
	email		TEXT UNIQUE,
	resetKey TEXT,
	isSuperAdmin	BOOLEAN NOT NULL,
	createdDate	TIMESTAMPTZ,
	updatedDate	TIMESTAMPTZ,
	lastLoginDate	TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS organizations (
	orgId		SERIAL PRIMARY KEY,
	orgName		TEXT NOT NULL UNIQUE,
	description	TEXT,
	createdDate	TIMESTAMPTZ,
	updatedDate	TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS groups (
	groupId     SERIAL PRIMARY KEY,
	groupName   TEXT NOT NULL,
	description	TEXT,
	orgId       INT NOT NULL REFERENCES organizations (orgId) ON DELETE CASCADE,
	createdDate	TIMESTAMPTZ,
	updatedDate	TIMESTAMPTZ,
	--jsonConfig	JSON NOT NULL,
	config      JSON NOT NULL,
	configseq   INT
);

-- define data types @ devices w/ constraints
--	firmware upgrade status
CREATE DOMAIN FSTATUS AS TEXT CHECK(VALUE ~
	'^(start|upgrad)ed|(download|switch)(ing|_failed)|writ(ing|e_failed)$');
-- 	public key
CREATE DOMAIN PKEY AS TEXT CHECK(VALUE ~ '^[Uu][0-9A-Za-z]{55}$');
-- 	optional mesh operating mode (range extender, central access point)
CREATE DOMAIN MODE AS TEXT CHECK(VALUE ~ '^(re|cap)$');

CREATE TABLE IF NOT EXISTS devices (
	deviceId        SERIAL PRIMARY KEY,
	deviceMac       MACADDR NOT NULL UNIQUE,
	deviceName      TEXT,
	--serialNo        TEXT UNIQUE,
	isRegistered    BOOLEAN NOT NULL,
	isConnected     BOOLEAN NOT NULL,
	fwVersion       TEXT,
	groupId         INT REFERENCES groups (groupId),
	orgId INT NOT NULL REFERENCES organizations (orgId) ON DELETE CASCADE,
	--status          BOOLEAN NOT NULL,
	firmware_status FSTATUS NULL,
	nkey            PKEY UNIQUE,
	heartbeat       TIMESTAMPTZ,
	counter         INT,
	config          JSON,
	configseq       INT,
	meshmode        MODE,
	board           TEXT,
	lastIntro       TIMESTAMPTZ,
	firmware_updated_time       TIMESTAMPTZ,
	updatedDate     TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION trigger_configseq()
RETURNS trigger AS
$$
	DECLARE
		-- declare function variables here
	BEGIN
		-- trigger top-level block special variables:
		RAISE NOTICE 'NEW: %', NEW;
		RAISE NOTICE 'TG_RELID: %', TG_RELID;
		RAISE NOTICE 'TG_TABLE_SCHEMA: %', TG_TABLE_SCHEMA;
		RAISE NOTICE 'TG_TABLE_NAME: %', TG_TABLE_NAME;
		RAISE NOTICE 'TG_RELNAME: %', TG_RELNAME;
		RAISE NOTICE 'TG_OP: %', TG_OP;
		RAISE NOTICE 'TG_WHEN: %', TG_WHEN;
		RAISE NOTICE 'TG_LEVEL: %', TG_LEVEL;
		RAISE NOTICE 'TG_NARGS: %', TG_NARGS;
		RAISE NOTICE 'TG_ARGV: %', TG_ARGV;

		-- ... trigger operation fired
		-- insert (w/ NEW row level trigger)
		IF (TG_OP = 'INSERT') THEN
			-- w/ first & new config
			IF (NEW.config IS NOT NULL) THEN
				OLD.config = NEW.config;
				NEW.configseq = 0;
			END IF;
			RETURN NEW;
		-- update (w/ NEW & OLD row level triggers)
		ELSEIF (TG_OP = 'UPDATE') THEN
			-- w/ ... config
			IF (NEW.config IS NOT NULL) THEN
				-- first
				IF (OLD.config IS NULL) THEN
					OLD.config = NEW.config;
					NEW.configseq = 0;
				-- new
				ELSEIF (NEW.config::text != OLD.config::text) THEN
					NEW.configseq = OLD.configseq + 1;
				END IF;
			END IF;
			RETURN NEW;
		END IF;
		-- ignore (delete, truncate) trigger operations
		RETURN NULL;
	END;
$$ LANGUAGE 'plpgsql';

-- define row level trigger (runs once per modified table row)
--	@ device
CREATE TRIGGER configseq_trigger
	BEFORE INSERT OR UPDATE ON devices
	FOR EACH ROW EXECUTE PROCEDURE trigger_configseq();
--	@ group
CREATE TRIGGER group_configseq_trigger
	BEFORE INSERT OR UPDATE ON groups
	FOR EACH ROW EXECUTE PROCEDURE trigger_configseq();

CREATE TABLE IF NOT EXISTS userOrganizations (
	userOrgId	SERIAL PRIMARY KEY,
	userId		INT NOT NULL REFERENCES users (userId) ON DELETE CASCADE,
	orgId		INT NOT NULL REFERENCES organizations (orgId) ON DELETE CASCADE,
	status 		TEXT NULL,
	key TEXT,
	roleId		INT,
	createdDate	TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS serverInfo (
	serverId	INT PRIMARY KEY NOT NULL,
	version		NUMERIC NOT NULL,
	initialSetup	BOOLEAN NOT NULL,
	sslStatus	BOOLEAN NOT NULL,
	sslVersion	TEXT NULL,
	domain		TEXT NULL,
	smtp 		BOOLEAN NOT NULL,
	smtp_user 	TEXT NULL,
	smtp_pass 	TEXT NULL,
	smtp_host 	TEXT NULL,
	smtp_port 	TEXT NULL,
	createdDate	TIMESTAMPTZ,
	updatedDate	TIMESTAMPTZ,
	smtp_email 	TEXT NULL
);

CREATE TABLE IF NOT EXISTS deviceStats (
	time               TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	deviceMac          MACADDR          NOT NULL,
	clientCount        INT                  NULL,
	healthyClients     INT                  NULL,
	cpuUsage           DOUBLE PRECISION     NULL,
	memoryUsage        DOUBLE PRECISION     NULL,
	throughputTx       DOUBLE PRECISION     NULL,
	throughputRx       DOUBLE PRECISION     NULL,
	clientThroughputTx BIGINT               NULL,
	clientThroughputRx BIGINT               NULL,
	clientTxBytes      BIGINT               NULL,
	clientRxBytes      BIGINT               NULL
);

-- define data types @ deviceInfo w/ constraints
--	mesh status
CREATE DOMAIN MSTATUS AS TEXT CHECK(VALUE ~ '^(dis)?connected$');
--	radio interface as mesh backhaul
CREATE DOMAIN RADIO AS TEXT CHECK(VALUE ~ '^wifi[0-2]$');
--	internet protocol (IP) version 4 address w/ optional mask or empty
CREATE DOMAIN IPV4 AS TEXT CHECK(VALUE ~
	'^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3}(/(3[0-2]|[1-2][0-9]|[0-9]))?|-)$');
-- 	optional mesh operating mode
--		(range extender, central access point, unknown) or empty
CREATE DOMAIN EMODE AS TEXT CHECK(VALUE ~ '^(re|cap|unknown|)$');
--	media access control (MAC) address or empty
CREATE DOMAIN MAC AS TEXT CHECK(VALUE ~
	'^([0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5}|-)$');

CREATE TABLE IF NOT EXISTS deviceInfo (
	deviceId INT NOT NULL REFERENCES devices (deviceId) ON DELETE CASCADE,
	updatedDate        TIMESTAMPTZ              ,
	cpuUsage           SMALLINT         NOT NULL,
	totalMemory        BIGINT           NOT NULL,
	usedMemory         BIGINT           NOT NULL,
	location           TEXT             NOT NULL,
	uptime             BIGINT           NOT NULL,
	wifi0mac           MACADDR              NULL,
	wifi0channel       SMALLINT             NULL,
	wifi0chwidth       TEXT                 NULL,
	wifi0txpower       SMALLINT             NULL,
	wifi1mac           MACADDR              NULL,
	wifi1channel       SMALLINT             NULL,
	wifi1chwidth       TEXT                 NULL,
	wifi1txpower       SMALLINT             NULL,
	wifi2mac           MACADDR              NULL,
	wifi2channel       SMALLINT             NULL,
	wifi2chwidth       TEXT                 NULL,
	wifi2txpower       SMALLINT             NULL,
	meshActive         BOOLEAN          NOT NULL,
	meshStatus         MSTATUS              NULL,
	meshRadio          RADIO                NULL,
	meship             IPV4                 NULL,
	meshMode           EMODE                NULL,
	meshUpstream       MAC                  NULL,
	meshNeighbors      JSON                 NULL,
	vaps               JSON             NOT NULL,
	clientCount        INT                  NULL,
	healthyClients     INT                  NULL,
	clientThroughputTx BIGINT               NULL,
	clientThroughputRx BIGINT               NULL,
	clientTxBytes      BIGINT               NULL,
	clientRxBytes      BIGINT               NULL,
	ip_address         INET                 NULL,
	ip_gateway         INET                 NULL,
	throughputTx       DOUBLE PRECISION     NULL,
	throughputRx       DOUBLE PRECISION     NULL
);

CREATE TABLE IF NOT EXISTS firmwares (
	firmwareId SERIAL PRIMARY KEY,
	filename      TEXT     NOT NULL,
	name      TEXT     NOT NULL,
	checksum      TEXT,
	createdDate TIMESTAMPTZ,
	board   TEXT     NOT NULL
);

CREATE TABLE IF NOT EXISTS version (
	value	INT
);

INSERT INTO serverInfo (serverId, version, initialSetup, sslstatus, smtp, createdDate, updatedDate)
VALUES(1, 1.0, 'TRUE', 'FALSE', 'FALSE', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO version (value) SELECT 23 WHERE NOT EXISTS (SELECT * FROM version);
