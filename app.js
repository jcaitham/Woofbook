const MANIFEST_URL = "pets/manifest.json";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const emptyEl = document.getElementById("empty");
const gridEl = document.getElementById("pet-grid");
const countEl = document.getElementById("pet-count");

function hideLoading() {
  loadingEl.hidden = true;
}

function createPetCard(pet) {
  const item = document.createElement("li");
  item.className = "pet-card";

  const name = escapeHtml(pet.name);
  const description = escapeHtml(pet.description);
  const contributor = escapeHtml(pet.contributor);
  const image = escapeHtml(pet.image);

  item.innerHTML = `
    <div class="pet-photo-wrap">
      <img
        class="pet-photo"
        src="${image}"
        alt="Photo of ${name}"
        loading="lazy"
        width="400"
        height="300"
      />
    </div>
    <div class="pet-body">
      <h2 class="pet-name">${name}</h2>
      <p class="pet-description">${description}</p>
      <p class="pet-meta">Added by ${contributor}</p>
    </div>
  `;

  return item;
}

async function loadPets() {
  try {
    const response = await fetch(MANIFEST_URL);

    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    const pets = await response.json();
    hideLoading();

    countEl.textContent = String(pets.length);

    if (pets.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const pet of pets) {
      fragment.appendChild(createPetCard(pet));
    }

    gridEl.appendChild(fragment);
    gridEl.hidden = false;
  } catch (error) {
    console.error(error);
    hideLoading();
    errorEl.hidden = false;
  }
}

loadPets();
