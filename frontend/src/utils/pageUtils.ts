// Utility functions for page management and error handling

export const saveCurrentPage = (path: string) => {
  if (path !== '/login' && path !== '/register' && path !== '/') {
    localStorage.setItem('lastVisitedPage', path);
  }
};

export const getLastVisitedPage = (): string | null => {
  return localStorage.getItem('lastVisitedPage');
};

export const clearLastVisitedPage = () => {
  localStorage.removeItem('lastVisitedPage');
};

export const getHomePageForUser = (isLoggedIn: boolean): string => {
  return isLoggedIn ? '/profile' : '/';
};

export const handleErrorRedirect = (error: Error, isLoggedIn: boolean) => {
  const homeUrl = getHomePageForUser(isLoggedIn);
  
  // Log the error for debugging
  console.error('Page error occurred:', error);
  
  // Show user-friendly message based on error type
  let message = 'An error occurred. Redirecting to home page...';
  
  if (error.message.includes('404') || error.message.includes('Not Found')) {
    message = 'Page not found. Redirecting to home page...';
  } else if (error.message.includes('Network')) {
    message = 'Network error detected. Redirecting to home page...';
  } else if (error.message.includes('Permission') || error.message.includes('401')) {
    message = 'Access denied. Redirecting to home page...';
  }
  
  // Save current page before redirect
  saveCurrentPage(window.location.pathname);
  
  return { redirectUrl: homeUrl, message };
};

export const restorePageOnAuth = (isLoggedIn: boolean): string | null => {
  if (isLoggedIn) {
    const lastPage = getLastVisitedPage();
    if (lastPage && lastPage !== '/login' && lastPage !== '/register') {
      clearLastVisitedPage();
      return lastPage;
    }
  }
  return null;
};
