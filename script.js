// Initialize favorites from localStorage
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || [];
  } catch (e) {
    return [];
  }
}

function setFavorites(arr) {
  localStorage.setItem('favorites', JSON.stringify(arr));
}

// Update the numeric badge next to the favorites button
function updateFavCount() {
  const countSpan = document.getElementById('favCount');
  if (countSpan) {
    countSpan.textContent = getFavorites().length;
  }
}

// Toggle add/remove favorite for a given device name
function toggleFavorite(deviceName) {
  let favs = getFavorites();
  if (!favs.includes(deviceName)) {
    favs.push(deviceName);
    alert(deviceName + ' تمت إضافته إلى المفضلة');
  } else {
    favs = favs.filter((item) => item !== deviceName);
    alert(deviceName + ' تمت إزالته من المفضلة');
  }
  setFavorites(favs);
  updateFavCount();
  // Update the list if the offcanvas is open
  updateFavoritesUI();
}

// Render the favorites list inside the offcanvas
function updateFavoritesUI() {
  const listElement = document.getElementById('favoritesList');
  const noFavMsg = document.getElementById('noFavorites');
  if (!listElement || !noFavMsg) return;
  listElement.innerHTML = '';
  const favs = getFavorites();
  if (favs.length === 0) {
    noFavMsg.style.display = 'block';
    return;
  }
  noFavMsg.style.display = 'none';
  favs.forEach((name) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML =
      '<span>' +
      name +
      '</span>' +
      '<i class="fa-solid fa-trash remove-btn ms-auto" data-name="' +
      name +
      '"></i>';
    listElement.appendChild(li);
  });
}

// Remove favorites by clicking trash icon
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const name = e.target.getAttribute('data-name');
    let favs = getFavorites();
    favs = favs.filter((item) => item !== name);
    setFavorites(favs);
    updateFavCount();
    updateFavoritesUI();
  }
});

// Initialize data on page load
document.addEventListener('DOMContentLoaded', () => {
  updateFavCount();
  updateFavoritesUI();
  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  // Update favorites list whenever offcanvas is opened
  const favCanvas = document.getElementById('favoritesCanvas');
  if (favCanvas) {
    favCanvas.addEventListener('show.bs.offcanvas', () => {
      updateFavoritesUI();
    });
  }
});