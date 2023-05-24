let body;
let themeBtn;
let searchInput;
let confirmBtn;
let errorInfo;
let mainContainer;
let selectOptions;
let currentFont;
let fontBtn;
let fontsBtns;

const prepareDOMElements = () => {
	body = document.querySelector('body');
	themeBtn = document.querySelector('.nav__mode-btn');
	themeBtnCircle = document.querySelector('.nav__mode-btn-circle');
	themeBtnImg = document.querySelector('.nav__mode-img');
	searchInput = document.querySelector('.search__input');
	confirmBtn = document.querySelector('.search__btn');
	errorInfo = document.querySelector('.search__error-info');
	mainContainer = document.querySelector('.container');
	currentFont = document.querySelector('.nav__fonts-current-font');
	fontBtn = document.querySelector('.nav__fonts');
	fontsBtns = document.querySelectorAll('.nav__fonts-list li');
};

const prepareDOMEvents = () => {
	themeBtn.addEventListener('click', handleThemeBtn);
	themeBtn.addEventListener('keyup', e => {
		if (e.key === 'Enter') {
			handleThemeBtn();
		}
	});
	searchInput.addEventListener('keyup', enterKeyCheck);
	confirmBtn.addEventListener('click', checkInput);
	fontBtn.addEventListener('click', handleFontsList);
	fontBtn.addEventListener('keyup', e => {
		if (e.key === 'Enter') {
			handleFontsList();
		}
	});
	fontsBtns.forEach(btn => btn.addEventListener('click', changeFont));
};

const main = () => {
	prepareDOMElements();
	prepareDOMEvents();
	checkPreferredColorScheme();
};

const checkPreferredColorScheme = () => {
	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		body.classList.add('dark-theme');
	} else {
		body.classList.add('light-theme');
	}
};

const handleThemeBtn = () => {
	if (body.classList.contains('dark-theme')) {
		body.classList.remove('dark-theme');
		body.classList.add('light-theme');
	} else {
		body.classList.remove('light-theme');
		body.classList.add('dark-theme');
	}
};

const handleFontsList = () => {
	fontBtn.classList.toggle('nav__fonts--active');
	if (fontBtn.classList.contains('nav__fonts--active')) {
		gsap.to('.nav__fonts-list', {
			display: 'block',
			scale: 1,
			duration: 0.3,
		});
	} else {
		gsap.to('.nav__fonts-list', {
			display: 'none',
			scale: 0,
			duration: 0.3,
		});
	}
};

const changeFont = e => {
	body.style.fontFamily = e.target.dataset.font;
	currentFont.textContent = e.target.textContent;
};

async function handleData() {
	try {
		const URL = `https://api.dictionaryapi.dev/api/v2/entries/en/${searchInput.value}`;
		const response = await axios.get(URL);

		if (response.status === 200) {
			const data = response.data;
			mainContainer.innerHTML = '';
			createFirstSection(data[0]);
			console.log(data);
		}
	} catch (error) {
		if (error.response && error.response.status === 404) {
			createSectionNotFound(error.response.data);
		} else {
			console.error(error);
		}
	}
}

const createSectionNotFound = data => {
	mainContainer.innerHTML = `
	<section class="not-found wrapper">
	<span class="not-found__emoji">😕</span>
	<strong class="not-found__title">${data.title}</strong>
	<p class="not-found__text">${data.message} ${data.resolution}</p>
	</section>
	`;
};

const createFirstSection = data => {
	const section = document.createElement('section');

	section.classList.add('first-section', 'wrapper');
	section.innerHTML = `
	<div class="first-section__box">
	<span class="first-section__box-word">${data.word}</span>
	<span class="first-section__box-pronounce">${data.phonetic}</span>
  	</div>
  	<button aria-label="play" class="first-section__btn">
	<svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
	<g fill="#A445ED" fill-rule="evenodd">
	<circle fill="#A445ED" cx="37.5" cy="37.5" r="37.5" opacity=".25" />
	<path d="M29 27v21l21-10.5z" />
	</g>
	</svg>
  	</button>
	`;

	mainContainer.appendChild(section);
};

const checkInput = () => {
	if (searchInput.value.length <= 0) {
		searchInput.classList.add('search__input--error');
		confirmBtn.classList.add('search__btn--error');
		errorInfo.style.visibility = 'visible';
	} else {
		searchInput.classList.remove('search__input--error');
		confirmBtn.classList.remove('search__btn--error');
		errorInfo.style.visibility = 'hidden';
		handleData();
	}
};

const enterKeyCheck = e => {
	if (e.key === 'Enter') {
		checkInput();
	}
};

document.addEventListener('DOMContentLoaded', main);
