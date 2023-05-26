-- Timescale table configuration

-- continuous-aggregates


-- device stats every 6hours
CREATE MATERIALIZED VIEW device_stats_6hours
WITH (timescaledb.continuous)
AS
SELECT
	time_bucket('6 hours', time) as bucket,
	deviceMac,
	avg(clientCount) as avg_client_count,
        max(clientCount) as max_client_count,
        min(clientCount) as min_client_count,
        avg(healthyclients) as avg_healthy_client_count,
        max(healthyclients) as max_healthy_client_count,
        min(healthyclients) as min_healthy_client_count,
        avg(cpuUsage) as avg_cpu_usage,
        max(memoryUsage) as max_memory_usage,
        min(memoryUsage) as min_memory_usage,
        avg(memoryUsage) as avg_memory_usage,
        avg(throughputTx) as avg_throughput_tx,
        avg(throughputRx) as avg_throughput_rx,
	min(throughputTx) as min_throughput_tx,
        min(throughputRx) as min_throughput_rx,
        max(throughputTx) as max_throughput_tx,
        max(throughputRx) as max_throughput_rx,
        avg(clientthroughputtx) as avg_clientthroughput_tx,
        avg(clientthroughputrx) as avg_clientthroughput_rx,
	min(clientthroughputtx) as min_clientthroughput_tx,
        min(clientthroughputrx) as min_clientthroughput_rx,
        max(clientthroughputtx) as max_clientthroughput_tx,
        max(clientthroughputrx) as max_clientthroughput_rx,
        max(clienttxbytes) as max_client_tx_bytes,
        max(clientrxbytes) as max_client_rx_bytes

FROM
	deviceStats
GROUP BY bucket, deviceMac
WITH NO DATA;

-- device stats every hour
CREATE MATERIALIZED VIEW device_stats_hour
WITH (timescaledb.continuous)
AS
SELECT
	time_bucket('1 hour', time) as bucket,
	deviceMac,
	avg(clientCount) as avg_client_count,
        max(clientCount) as max_client_count,
        min(clientCount) as min_client_count,
        avg(healthyclients) as avg_healthy_client_count,
        max(healthyclients) as max_healthy_client_count,
        min(healthyclients) as min_healthy_client_count,
        avg(cpuUsage) as avg_cpu_usage,
        max(memoryUsage) as max_memory_usage,
        min(memoryUsage) as min_memory_usage,
        avg(memoryUsage) as avg_memory_usage,
        avg(throughputTx) as avg_throughput_tx,
        avg(throughputRx) as avg_throughput_rx,
	min(throughputTx) as min_throughput_tx,
        min(throughputRx) as min_throughput_rx,
        max(throughputTx) as max_throughput_tx,
        max(throughputRx) as max_throughput_rx,
        avg(clientthroughputtx) as avg_clientthroughput_tx,
        avg(clientthroughputrx) as avg_clientthroughput_rx,
	min(clientthroughputtx) as min_clientthroughput_tx,
        min(clientthroughputrx) as min_clientthroughput_rx,
        max(clientthroughputtx) as max_clientthroughput_tx,
        max(clientthroughputrx) as max_clientthroughput_rx,
        max(clienttxbytes) as max_client_tx_bytes,
        max(clientrxbytes) as max_client_rx_bytes

FROM
	deviceStats
GROUP BY bucket, deviceMac
WITH NO DATA;

-- device stats every 10 minutes
CREATE MATERIALIZED VIEW device_stats_10minutes
WITH (timescaledb.continuous)
AS
SELECT
        time_bucket('10 minute', time) as bucket,
        deviceMac,
	avg(clientCount) as avg_client_count,
        max(clientCount) as max_client_count,
        min(clientCount) as min_client_count,
        avg(healthyclients) as avg_healthy_client_count,
        max(healthyclients) as max_healthy_client_count,
        min(healthyclients) as min_healthy_client_count,
        avg(cpuUsage) as avg_cpu_usage,
        max(memoryUsage) as max_memory_usage,
        min(memoryUsage) as min_memory_usage,
        avg(memoryUsage) as avg_memory_usage,
        avg(throughputTx) as avg_throughput_tx,
        avg(throughputRx) as avg_throughput_rx,
	min(throughputTx) as min_throughput_tx,
        min(throughputRx) as min_throughput_rx,
        max(throughputTx) as max_throughput_tx,
        max(throughputRx) as max_throughput_rx,
        avg(clientthroughputtx) as avg_clientthroughput_tx,
        avg(clientthroughputrx) as avg_clientthroughput_rx,
	min(clientthroughputtx) as min_clientthroughput_tx,
        min(clientthroughputrx) as min_clientthroughput_rx,
        max(clientthroughputtx) as max_clientthroughput_tx,
        max(clientthroughputrx) as max_clientthroughput_rx,
        max(clienttxbytes) as max_client_tx_bytes,
        max(clientrxbytes) as max_client_rx_bytes
FROM
        deviceStats
GROUP BY bucket, deviceMac
WITH NO DATA;



/*
 * device_stats_6hours policy
 * aggregate data that is older than 2 weeks
 */

SELECT
	add_continuous_aggregate_policy('device_stats_6hours',
	start_offset => INTERVAL '3 week',
	end_offset => INTERVAL '1 week',
	schedule_interval => INTERVAL '1 week');

/*
 * device_stats_hour policy
 * aggregate data that is older than week
 */
SELECT
        add_continuous_aggregate_policy('device_stats_hour',
        start_offset => INTERVAL '9 day',
        end_offset => INTERVAL '7 day',
        schedule_interval => INTERVAL '1 day');

/*
 * device_stats_10minute policy
 * aggregate newest data
 */
SELECT
        add_continuous_aggregate_policy('device_stats_10minutes',
        start_offset => INTERVAL '26 hours',
        end_offset => INTERVAL '24 hours',
        schedule_interval => INTERVAL '1 hour');


-- retention policy deletes old data
SELECT add_retention_policy('deviceStats', INTERVAL '1 month');


