// Sends every request for www.litespec.dev to the same path and query on litespec.dev,
// so the site has one address. A permanent redirect lets browsers and search engines learn it.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = "litespec.dev";
    url.protocol = "https:";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  },
};
