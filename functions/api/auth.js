const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/api/auth/callback`,
    scope: "repo,user",
    state: crypto.randomUUID(),
  });
  return Response.redirect(`${GITHUB_AUTH_URL}?${params}`, 302);
}
