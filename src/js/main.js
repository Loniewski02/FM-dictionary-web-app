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

let errorSection;
let firstSection;

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

	errorSection = document.querySelector('.not-found');
	firstSection = document.querySelector('.first-section');
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
			handleFirstSection(data);
			console.log(data);
		}
	} catch (error) {
		if (error.response && error.response.status === 404) {
			handleErrorSection(error.response.data);
		} else {
			console.error(error);
		}
	}
}

const handleErrorSection = data => {
	const title = errorSection.querySelector('.not-found__title');
	const text = errorSection.querySelector('.not-found__text');
	const emoji = errorSection.querySelector('.not-found__emoji');
	errorSection.style.display = 'flex';
	firstSection.style.display = 'none';
	title.textContent = data.title;
	text.textContent = data.message + ' ' + data.resolution;
	emoji.textContent = '😕';
};

const handleFirstSection = data => {
	const wordSpan = firstSection.querySelector('.first-section__box-word');
	const pronounceSpan = firstSection.querySelector('.first-section__box-pronounce');
	const playBtn = firstSection.querySelector('.first-section__btn');

	errorSection.style.display = 'none';
	firstSection.style.display = 'flex';

	wordSpan.textContent = data[0].word;
	if (data[0].phonetics.length <= 0) {
		pronounceSpan.style.visibility = 'hidden';
	} else {
		pronounceSpan.style.visibility = 'visible';

		for (let i = 0; i < data[0].phonetics.length; i++) {
			if (
				data[0].phonetics[i].text &&
				data[0].phonetics[i].text !== '' &&
				data[0].phonetics[i].audio &&
				data[0].phonetics[i].audio !== ''
			) {
				pronounceSpan.textContent = data[0].phonetics[i].text;
				pronounceSpan.style.visibility = 'visible';
				playBtn.src = data[0].phonetics[i].audio;
				break;
			}
		}
	}

	playBtn.addEventListener('click', () => {
		let audio = new Audio(playBtn.src);
		audio.play();
	});
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
