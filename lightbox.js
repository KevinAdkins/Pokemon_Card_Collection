// imported from previous html project "Hallo Gallery", changed line 5 from "gallery img" to "card img" 
const lb = document.getElementById('lightbox');    // lb = overall lightbox container (the popup overlay)
const lbImg = document.getElementById('lightbox-img');  // the big image of the image in lightbox
const lbCap = document.getElementById('lightbox-cap'); // the caption of the image
let images = Array.from(document.querySelectorAll('.card img')); // finds all images in gallery (made let so we can refresh)
const closeBtn = document.querySelector('.close'); // finds the close button (escape)
const nextBtn = document.querySelector('.next'); // finds the next button (right arrow)
const prevBtn = document.querySelector('.prev'); // finds the previous button (left arrow)

let currentIndex = 0; // keeps track of which image is currently being shown

images.forEach((img, idx) => { // loops through all found images
  img.addEventListener('click', () => { // adds click event listener to each image
    currentIndex = idx; // set which image was clicked so arrows go next/prev from here
    lbImg.src = img.src; // just copies the image url to the big image
    lbImg.alt = img.alt || ''; // copies alt text or makes it blank if no alt text
    lbCap.textContent = img.alt || ''; // copies caption text or makes it blank if no alt text
    lb.classList.add('open'); // adds the open class to lightbox so css can make it visible
    lb.setAttribute('aria-hidden', 'false'); // accessibility, tells screen readers it's visible now
  });
});

function showImage(index) { // function to show image based on index
  const img = images[index]; // gets the image at the specified index
  lbImg.src = img.src; // sets the lightbox image source
  lbImg.alt = img.alt || ''; // sets the alt text
  lbCap.textContent = img.alt || ''; // sets the caption text
}

nextBtn.addEventListener('click', e => { // click behavior for next button
  e.stopPropagation(); // stops the click from bubbling up to the lightbox container
  currentIndex = (currentIndex + 1) % images.length; // increments index and wraps around if at end
  showImage(currentIndex); // shows the image at the new index
});

prevBtn.addEventListener('click', e => { // click behavior for previous button
  e.stopPropagation(); // stops the click from bubbling up to the lightbox container
  currentIndex = (currentIndex - 1 + images.length) % images.length; // decrements index and wraps around if at start
  showImage(currentIndex); // shows the image at the new index
});

lb.addEventListener('click', e => { // click behavior for lightbox
  if (e.target === lb || e.target.classList.contains('close')) closeLB(); // if they click the overlay or the close button, close the lightbox
});

document.addEventListener('keydown', e => { // keydown behavior for whole document
  if (e.key === 'Escape' && lb.classList.contains('open')) closeLB(); // if they press escape and the lightbox is open, close the lightbox
  if (e.key === 'ArrowRight' && lb.classList.contains('open')) { // if they press right arrow and the lightbox is open
    currentIndex = (currentIndex + 1) % images.length; // increments index and wraps around if at end
    showImage(currentIndex); // shows the image at the new index
  }
  if (e.key === 'ArrowLeft' && lb.classList.contains('open')) { // if they press left arrow and the lightbox is open
    currentIndex = (currentIndex - 1 + images.length) % images.length; // decrements index and wraps around if at start
    showImage(currentIndex); // shows the image at the new index
  }
}); // these brackets are vital in the arrowkeys working

function closeLB() { // function to close the lightbox
  lb.classList.remove('open'); // removes the open class so css can hide it
  lb.setAttribute('aria-hidden', 'true'); // accessibility, tells screen readers it's hidden now
  lbImg.src = ''; // clear the image src so old image doesn't flash if new image is slow to load
}


// this will handle the "search" part of the search bar so it actually works
// if i want to use an API key once this idea becomes bigger, here it is API KEY: 93df34da-ce28-4bd2-bd34-1a3177c370dc

(() => { // creates a self-contained function so variables here don’t affect the rest of my code
  const form  = document.querySelector('.search-form'); // finds the search bar form element
  const input = document.querySelector('.search-input'); // finds the search text input box
  const cards = Array.from(document.querySelectorAll('.card')); // gets all card containers on the page

  if (!form || !input || !cards.length) return; // if the elements don't exist, stop running this code

  // debounce timer setup (to avoid running the search every millisecond while typing)
  let t; 
  const debounce = (fn, ms = 200) => (...a) => { // waits a short delay before running the function
    clearTimeout(t); // clears previous timer so only the last keystroke counts
    t = setTimeout(() => fn(...a), ms); // runs the function after delay (200ms)
  };

  function normalize(s) { // converts text to lowercase and removes extra spaces
    return (s || '').toString().toLowerCase().trim(); // ensures case-insensitive comparisons
  }

  function cardMatches(card, q) { // checks if a specific card matches the search query
    const img = card.querySelector('img'); // gets the image inside the card
    if (!img) return false; // if no image found, skip this card

    const alt  = normalize(img.alt); // makes the alt text lowercase
    const file = normalize(decodeURIComponent(img.src.split('/').pop() || '')); // gets the image filename
    const tagsRaw = img.getAttribute('data-tags') || '';  // e.g., "Shiny, Japanese"
    const tags = normalize(tagsRaw); // "shiny, japanese"
    const tagList = tags ? tags.split(',').map(s => s.trim()) : []; // ["shiny","japanese"]

    return (
      alt.includes(q) ||
      file.includes(q) ||
      tags.includes(q) || // match the whole tag string
      tagList.some(t => t.includes(q)) // match any individual tag
    );
  }

  function filterCards(qRaw) { // main function that filters which cards are visible
    const q = normalize(qRaw); // lowercase version of what the user typed

    cards.forEach(card => { // goes through every card
      if (!q || cardMatches(card, q)) { // if there's no query OR the card matches
        card.style.display = ''; // show the card
      } else {
        card.style.display = 'none'; // hide the card
      }
    });

    // update the "images" list used by your lightbox so arrows only scroll through visible cards
    images = Array
      .from(document.querySelectorAll('.card img')) // gets all visible card images
      .filter(img => img.closest('.card')?.style.display !== 'none'); // filters out hidden ones

    // checks if lightbox is open right now
    if (lb.classList.contains('open')) {
      // see if the currently displayed image is still visible after filtering
      const stillVisible = images.some(img => img.src === lbImg.src);
      if (!stillVisible) {
        closeLB(); // closes lightbox if current image was filtered out
      } else {
        // fixes the "currentIndex" so arrows go to the correct next/previous card
        const idx = images.findIndex(img => img.src === lbImg.src);
        if (idx !== -1) currentIndex = idx; // updates the index if found
      }
    }
  }

  // runs the filter while typing (with a short delay)
  input.addEventListener('input', debounce(e => filterCards(e.target.value), 200));

  // prevents the search form from reloading the page when pressing Enter
  form.addEventListener('submit', e => {
    e.preventDefault(); // stops the normal form submit behavior
    filterCards(input.value); // runs the filter with the current search text
  });
})(); // immediately runs this entire function when the page loads