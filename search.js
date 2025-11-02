const searchInput = document.querySelector("[data-search]")
const userCardTemplate = document.querySelector("[data-user-template]")
const userCardContainer = document.querySelector("[data-user-cards-container]")

let users = []

searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase()
  users.forEach(user => {
    const isVisible =
      user.name.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value)
    user.element.classList.toggle("hide", !isVisible)
  })
})

fetch("https://jsonplaceholder.typicode.com/users")
  .then(res => res.json())
  .then(data => {
    users = data.map(user => {
      const card = userCardTemplate.content.cloneNode(true).children[0]
      const header = card.querySelector("[data-header]")
      const body = card.querySelector("[data-body]")
      header.textContent = user.name
      body.textContent = user.email
      userCardContainer.append(card)
      return { name: user.name, email: user.email, element: card }
    })
  })
window.__getImgTags = function(imgEl) {
  if (!imgEl) return [];
  const raw = (imgEl.getAttribute('data-tags') || '').toLowerCase().trim();
  return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
};
window.addEventListener('scroll', function() {
    if (window.scrollY > 10) { // number of pixels to scroll before dimming, the whole search bar should dim but it isn't but i'm not hating how it works rn so i'm ok with how it is
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});