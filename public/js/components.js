document.addEventListener("DOMContentLoaded", () => {

    const loadComponent = async (selector, path) => {
      const element = document.querySelector(selector);
      if (!element) return;
  
      const response = await fetch(path);
      element.innerHTML = await response.text();
    };
  
    loadComponent("#header", "../../website/components/header.html");
    loadComponent("#nav", "../../website/components/nav.html");
    loadComponent("#footer", "../../website/components/footer.html");
  });
  
  