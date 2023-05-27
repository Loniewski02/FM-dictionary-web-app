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
let definitionSection;

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
	definitionSection = document.querySelector('.definition-container');
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
		const word = searchInput.value.toLowerCase();
		const URL = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
		const response = await axios.get(URL);

		if (response.status === 200) {
			const data = response.data;
			definitionSection.innerHTML = '';
			handleFirstSection(data);
			prepareDefinitionSections(data);
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
	const playBtn = firstSection.querySelector('.first-section__btn');
	errorSection.style.display = 'flex';
	firstSection.style.display = 'none';
	definitionSection.innerHTML = '';
	title.textContent = data.title;
	text.textContent = data.message + ' ' + data.resolution;
	emoji.textContent = '😕';
	playBtn.src = '';
};

const handleFirstSection = data => {
	const wordSpan = firstSection.querySelector('.first-section__box-word');
	const pronounceSpan = firstSection.querySelector('.first-section__box-pronounce');
	const playBtn = firstSection.querySelector('.first-section__btn');

	errorSection.style.display = 'none';
	firstSection.style.display = 'flex';

	wordSpan.textContent = data[0].word;
	setPronunciationAndPlayButton(data, pronounceSpan, playBtn);
};

const setPronunciationAndPlayButton = (data, pronounceSpan, playBtn) => {
	let pronunciation = '';
	let audioSrc = '';

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].phonetics.length; j++) {
			if (
				data[i].phonetics[j].text &&
				data[i].phonetics[j].text !== '' &&
				data[i].phonetics[j].audio &&
				data[i].phonetics[j].audio !== ''
			) {
				pronunciation = data[i].phonetics[j].text;
				audioSrc = data[i].phonetics[j].audio;
				break;
			} else {
				for (let k = 0; k < data[i].phonetics.length; k++) {
					if (data[i].phonetics[k].text && data[i].phonetics[k].text !== '') {
						pronunciation = data[i].phonetics[k].text;
					}
					if (data[i].phonetics[k].audio && data[i].phonetics[k].audio !== '') {
						audioSrc = data[i].phonetics[k].audio;
					}
					break;
				}
			}
		}
	}

	if (pronunciation === '') {
		pronounceSpan.textContent = '/ not available /';
		playBtn.src = '';
	} else {
		pronounceSpan.textContent = pronunciation;
		playBtn.src = audioSrc;
		playBtn.addEventListener('click', () => {
			playAudio(playBtn.src);
		});
	}
};

const playAudio = src => {
	let audio = new Audio(src);
	audio.play();
};

const prepareDefinitionSections = data => {
	const synonymsObject = {
		verb: [],
		noun: [],
		adjective: [],
	};

	const definitionObject = {
		verb: [],
		noun: [],
		adjective: [],
	};

	for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].meanings.length; j++) {
			const meaning = data[i].meanings[j];

			if (meaning.hasOwnProperty('synonyms') && Array.isArray(meaning.synonyms)) {
				const synonyms = meaning.synonyms;

				for (let k = 0; k < synonyms.length; k++) {
					if (
						synonymsObject.hasOwnProperty(meaning.partOfSpeech) &&
						!synonymsObject[meaning.partOfSpeech].includes(synonyms[k])
					) {
						synonymsObject[meaning.partOfSpeech].push(synonyms[k]);
					}
				}
			}

			if (meaning.hasOwnProperty('definitions') && Array.isArray(meaning.definitions)) {
				const definitions = meaning.definitions;

				for (let k = 0; k < definitions.length; k++) {
					const definition = {
						definition: definitions[k].definition,
						example: definitions[k].example,
					};

					if (
						definitionObject.hasOwnProperty(meaning.partOfSpeech) &&
						!definitionObject[meaning.partOfSpeech].includes(definition)
					) {
						definitionObject[meaning.partOfSpeech].push(definition);
					}
				}
			}
		}
	}

	createSections(synonymsObject, definitionObject);
	createFooterSection(data);
};

const createSections = (synonymsObject, definitionObject) => {
	if (definitionObject.noun.length > 0) {
		createSection(synonymsObject.noun, 'noun', definitionObject.noun);
	}
	if (definitionObject.verb.length > 0) {
		createSection(synonymsObject.verb, 'verb', definitionObject.verb);
	}
	if (definitionObject.adjective.length > 0) {
		createSection(synonymsObject.adjective, 'adjective', definitionObject.adjective);
	}
};

const createSection = (syn, speech, def) => {
	const sectionNoun = document.createElement('div');
	sectionNoun.classList.add('definition', 'wrapper');
	sectionNoun.innerHTML = `<p class="definition__title">${speech} <span class="line"></span></p>`;

	const list = document.createElement('dl');
	list.classList.add('definition__list');
	list.innerHTML = `<dt class="definition__list-title">Meaning</dt>`;

	def.forEach(item => {
		const definitionItem = document.createElement('dd');
		definitionItem.classList.add('definition__list-def');
		definitionItem.innerHTML = item.definition;

		const exampleItem = document.createElement('dd');
		if (item.example !== undefined) {
			exampleItem.classList.add('definition__list-def', 'definition__list-def--example');
			exampleItem.innerHTML = item.example;
		}

		list.appendChild(definitionItem);
		list.appendChild(exampleItem);
	});

	sectionNoun.appendChild(list);

	if (syn.length > 0) {
		const synonyms = document.createElement('div');
		synonyms.classList.add('definition__synonyms');
		synonyms.innerHTML = `<span class='definition__synonyms-title'>Synonyms</span>`;

		const span = document.createElement('span');
		span.classList.add('definition__synonyms-synonym');

		for (let i = 0; i < syn.length; i++) {
			if (i === 0) {
				span.innerHTML += syn[i];
			} else {
				span.innerHTML += `, ${syn[i]}`;
			}
		}

		synonyms.appendChild(span);
		sectionNoun.appendChild(synonyms);
	}

	definitionSection.appendChild(sectionNoun);
};

const createFooterSection = linkUrl => {
	const footer = document.createElement('div');
	footer.classList.add('footer');
	footer.innerHTML = `
	<div class="wrapper">
	<div class="footer__line"></div>
	<div class="footer__box">
	  <p class="footer__source">Source</p>
	  <a href="${linkUrl[0].sourceUrls}" class="footer__link">${linkUrl[0].sourceUrls[0]}</a>
	</div>
  	</div>`;

	definitionSection.appendChild(footer);
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
