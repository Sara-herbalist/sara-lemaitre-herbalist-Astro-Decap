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
    const token = data.access_token;

    if (!token) {
      return new Response(
        `<html><body><p>Auth error: ${JSON.stringify(data)}</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const message = JSON.stringify({ token, provider: "github" });
    const html = `<!DOCTYPE html><html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:success:${message.replace(/'/g, "\\'")}', e.origin);
  }
  window.addEventListener('message', receiveMessage, false);
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  }
})();
</script>
</body></html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response("Not found", { status: 404 });
}
