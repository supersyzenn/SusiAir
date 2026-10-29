export default defineNuxtRouteMiddleware(to => {
  const session = useSessionStore();
  session.restore();
  if (!session.token && to.path !== '/sign-in') return navigateTo('/sign-in');
  if (session.token && to.path === '/sign-in') return navigateTo('/');
});
