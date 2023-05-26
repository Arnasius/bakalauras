import { getCurrentOrganization } from "./organizations";
import notify from "./notify";

const HTTP_FAIL_NETWORK = 1;
const HTTP_FAIL_PROTOCOL = 2;

var interceptors = [];

function buildUrl(uri, query, org) {
  let url = window.location.origin;
  var currentOrg = getCurrentOrganization();
  if (!url) url = window.location.protocol + "//" + window.location.host;
  url += "/api";
  if (org) url += "/organizations/" + currentOrg;
  if (!uri.startsWith("/")) url += "/";
  url += uri;
  if (query) url += "?" + query;
  return url;
}

function httpIntercept(interceptor) {
  /* Sanitize interceptor in favor for bug-free programming. */
  Object.keys(interceptor).forEach((target) => {
    let handler = interceptor[target];
    switch (target) {
      case "request":
      case "requestError":
      case "response":
      case "responseError":
        break;
      default:
        throw new Error(`Unknown interceptor target: ${target}`);
    }
    if (typeof handler !== "function")
      throw new Error(
        `Invalid interceptor target type: ${typeof handler} (${target})`
      );
  });
  interceptors.push(interceptor);
}

function httpRequest(config) {
  /* Prepare and chain request interceptor. If promise
   * resolved it MUST always resolve request config. */
  let requestPromise = Promise.resolve(config);
  interceptors.forEach((interceptor) => {
    if (interceptor.request)
      requestPromise = requestPromise.then(interceptor.request);
  });

  return requestPromise.then((config) => {
    if (!config.url) throw new Error("Request config missing URL");

    /* Insert HTTP method for consistency. */
    config.method = config.method || "GET";
    return fetch(config.url, config)
      .then(
        (response) => {
          /* Prepare response and responseError interceptors
           * based on response status. */
          let responsePromise;
          if (response.ok) responsePromise = Promise.resolve(response);
          else responsePromise = Promise.reject(response);

          /* Chain response and responseError interceptors.
           * Despite promise is resolved or rejected it MUST
           * always resolve response instance. */
          interceptors.forEach((interceptor) => {
            if (interceptor.response || interceptor.responseError)
              responsePromise = responsePromise.then(
                interceptor.response,
                interceptor.responseError
              );
          });

          /* Wrap up responseError rejection into unified object. */
          return responsePromise.catch((response) => {
            return Promise.reject({
              type: HTTP_FAIL_PROTOCOL,
              message: response.text(),
              response,
            });
          });
        },
        (exception) => {
          /* Mutating config object. */
          config.error = exception;

          /* Prepare and chain requestError interceptor. If
           * promise resolved it MUST always resolve response
           * instance. If promise rejected it MAY reject with
           * same config instance or any message content. */
          let responsePromise = Promise.reject(config);
          interceptors.forEach((interceptor) => {
            if (interceptor.requestError)
              responsePromise = responsePromise.then(
                interceptor.response,
                interceptor.requestError
              );
          });

          /* Wrap up requestError rejection into unified object. */
          return responsePromise.catch((rejection) => {
            let message =
              (typeof rejection === "object" && rejection.error) || rejection;
            console.warn(`${config.method} ${config.url} error: ${message}`);
            return Promise.reject({
              type: HTTP_FAIL_NETWORK,
              message,
            });
          });
        }
      )
      .catch((err) => {
        console.error("Error:", err);

        let errorMessage;
        if (typeof err.message.message === "string") {
          throw new Error(err.message?.message);
        } else {
          return Promise.resolve(err.message).then((res) => {
            try {
              errorMessage = JSON.parse(res).message;
            } catch (error) {
              errorMessage = err?.response?.statusText;
            }
            notify.emit("error", errorMessage);

            throw new Error(errorMessage);
          });
        }
      });
  });
}

function httpGet(uri, params, org) {
  let query;
  for (let key in params) {
    if (!query) query = "";
    else query += "&";

    query += key + "=" + params[key];
  }

  return httpRequest({
    url: buildUrl(uri, query, org),
  }).then((response) => {
    let len = +response.headers.get("content-length");
    if (!len || len === 0) {
      return null;
    }
    return response.json();
  });
}

function httpPostGeneric(uri, data, method, org) {
  let req_params = {
    url: buildUrl(uri, "", org),
    method: method, // 'POST' or 'PUT' or 'DELETE'
    //body: contentData, // data can be `string` or {object}!
    //headers:{
    //'Content-Type': contentType,
    //}
  };
  if (data instanceof FormData) {
    // let browser set Content-Type+boundary
    //req_params.headers = {'Content-Type': 'multipart/form-data'};
    req_params.body = data;
  } else if (data !== undefined && data !== null) {
    req_params.headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
    };
    req_params.body = JSON.stringify(data);
  }

  return httpRequest(req_params).then((response) => {
    let len = +response.headers.get("content-length");
    if (!len || len === 0) {
      return null;
    }

    const response2 = response.clone();
    response2.json().then((res) => {
      res.message ? notify.emit("success", res.message) : null;
    });

    return response.json();
  });
}

function httpPost(uri, data, org) {
  return httpPostGeneric(uri, data, "POST", org);
}

function httpPut(uri, data) {
  return httpPostGeneric(uri, data, "PUT");
}

function httpDelete(uri, data, org) {
  return httpPostGeneric(uri, data, "DELETE", org);
}

export default {
  intercept: httpIntercept,
  request: httpRequest,
  get: httpGet,
  post: httpPost,
  put: httpPut,
  delete: httpDelete,
};
