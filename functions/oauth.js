const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
 
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
 
  // Handle /oauth — redirect to GitHub
  if (url.pathname === "/oauth") {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: `${url.origin}/oauth/callback`,
      scope: "repo,user",
      state: crypto.randomUUID(),
    });
    return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
  }
 
  // Handle /oauth/callback — exchange code for token
  if (url.pathname === "/oauth/callback") {
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response("Missing code", { status: 400 });
    }
 
    let token;
    try {
      const response = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });
      const data = await response.json();
      token = data.access_token;
 
      if (!token) {
        return new Response(
          `<html><body><p>Token error: ${JSON.stringify(data)}</p></body></html>`,
          { status: 400, headers: { "Content-Type": "text/html" } }
        );
      }
    } catch (err) {
      return new Response(
        `<html><body><p>Error: ${err.message}</p></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }
 
    const token_str = JSON.stringify({ token, provider: "github" });
 
    const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<p>Authorization complete. You can close this window.</p>
<script>
(function() {
  var token_data = ${token_str};
  var message = 'authorization:github:success:' + JSON.stringify(token_data);
  
  if (window.opener) {
    // Send success message to opener
    window.opener.postMessage(message, '*');
    // Close popup after short delay
    setTimeout(function() { window.close(); }, 500);
  } else {
    // No opener - redirect to admin
    window.location.href = '/admin';
  }
})();
</script>
</body>
</html>`;
 
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }
 
  return new Response("Not found", { status: 404 });
}
