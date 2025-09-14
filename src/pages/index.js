import "./index.css";

import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";

import Api from "../utils/Api.js";

/*const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];*/

const defaultAvatar =
  "https://pictures.s3.yandex.net/frontend-developer/common/ava.jpg";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "2430d14c-6574-4762-a9ad-dd1fba3c1000",
    "Content-Type": "application/json",
  },
});

let selectedCardId;
let selectedCard = null;
let currentUserId;

// DOM elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editProfileModal = document.querySelector("#edit-profile-modal");
const profileForm = document.forms["edit-profile-form"];
const editModalNameInput = document.querySelector("#profile-name-input");
const editProfileDescriptionInput = document.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardForm = document.forms["add-card-form"];
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const avatarModal = document.querySelector("#edit-avatar-modal");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const avatarForm = document.forms["edit-avatar-form"];
const avatarInput = document.querySelector("#profile-avatar-input");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const profileAvatar = document.querySelector(".profile__avatar");

const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.forms["delete-form"];
const deleteCancelBtn = deleteForm.querySelector(".modal__cancel-btn");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// DELETE CARD
function handleDeleteCard(cardId, cardElement) {
  api
    .deleteCard(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch(console.error);
}

function handleLike(evt, id) {
  const likeButton = evt.target;
  const isLiked = likeButton.classList.contains("card__like-btn_liked");

  api
    .changeCardLikeStatus(id, isLiked)
    .then((updatedCard) => {
      console.log("🔍 API Response:", updatedCard);

      if (updatedCard.isLiked) {
        likeButton.classList.add("card__like-btn_liked");
      } else {
        likeButton.classList.remove("card__like-btn_liked");
      }
    })
    .catch((err) => {
      console.error("Error updating like status:", err);
    });
}

// CREATE CARD
function getCardElement(data) {
  if (!Array.isArray(data.likes)) {
    data.likes = [];
  }

  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardLikeBtn.addEventListener("click", (evt) => {
    handleLike(evt, data._id);
  });

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  cardDeleteBtn.addEventListener("click", () => {
    selectedCardId = data._id;
    selectedCard = cardElement;
    openModal(deleteModal);
  });

  return cardElement;
}

// FORMS & EVENT HANDLERS
deleteCancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
  selectedCardId = null;
  selectedCard = null;
});

function handleClickOutside(e) {
  if (e.target.classList.contains("modal")) {
    closeModal(e.target);
  }
}

function handleEscapeKey(e) {
  if (e.key === "Escape") {
    const activeModal = document.querySelector(".modal_opened");
    closeModal(activeModal);
  }
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  modal.addEventListener("mousedown", handleClickOutside);
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  modal.removeEventListener("mousedown", handleClickOutside);
  document.removeEventListener("keydown", handleEscapeKey);
}

function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  const saveBtn = profileForm.querySelector(".modal__submit-btn");
  saveBtn.textContent = "Saving...";

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      saveBtn.textContent = "Save";
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  cardSubmitBtn.textContent = "Saving...";

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  api
    .addCard({ name, link })
    .then((newCardData) => {
      const cardElement = getCardElement(newCardData);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      cardSubmitBtn.textContent = "Create";
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  avatarSubmitBtn.textContent = "Saving...";

  api
    .updateUserAvatar({ avatar: avatarInput.value })
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      avatarSubmitBtn.textContent = "Save";
    });
}

function resetAvatarToDefault() {
  api
    .updateUserAvatar({ avatar: defaultAvatar })
    .then((data) => {
      profileAvatar.src = data.avatar;
      profileAvatar.alt = profileName.textContent;
    })
    .catch(console.error);
}

// MODAL OPENS
profileEditButton.addEventListener("click", () => {
  editProfileDescriptionInput.value = profileDescription.textContent;
  editModalNameInput.value = profileName.textContent;
  resetValidation(
    profileForm,
    [editModalNameInput, editProfileDescriptionInput],
    settings
  );
  openModal(editProfileModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

// FORM SUBMITS
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);

// DELETE SUBMIT
deleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (selectedCardId && selectedCard) {
    handleDeleteCard(selectedCardId, selectedCard);
    closeModal(deleteModal);
    selectedCardId = null;
    selectedCard = null;
  }
});

// CLOSE BUTTONS
const closeButtons = document.querySelectorAll(".modal__close-btn");
closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

// ENABLE FORM VALIDATION
enableValidation(settings);

// ✅ API call happens last, after DOM variables exist
api
  .getAppInfo()
  .then(({ user, cards }) => {
    currentUserId = user._id;

    profileName.textContent = user.name;
    profileDescription.textContent = user.about;

    if (profileAvatar) {
      profileAvatar.src = user.avatar;
      profileAvatar.alt = user.name;
    }

    cards.forEach((cardData) => {
      const card = getCardElement(cardData);
      cardsList.appendChild(card);
    });
  })
  .catch(console.error);
