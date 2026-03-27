const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code parameter", { status: 400 });
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
        `<html><body><p>Auth error: ${JSON.stringify(data)}</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (err) {
    return new Response(
      `<html><body><p>Fetch error: ${err.message}</p></body></html>`,
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  const message = JSON.stringify({ token, provider: "github" });

  const html = `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p>Authenticating, please wait...</p>
<script>
(function() {
  var message = 'authorization:github:success:${message.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}';
  function receiveMessage(e) {
    console.log('receiveMessage', e);
    window.opener.postMessage(message, e.origin);
  }
  window.addEventListener('message', receiveMessage, false);
  console.log('Sending authorizing message to opener');
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  } else {
    console.error('No window.opener found');
    document.body.innerHTML = '<p>Error: popup was not opened correctly. Please try again.</p>';
  }
})();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
