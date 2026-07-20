console.log("PART 1 LOADED: E-Library Home - Laptop");

let isDark = false;
let currentSize = 100;
let selectedGender = 'female';
let currentRate = 1;
let femaleVoice = null;
let maleVoice = null;
let voices = [];
let voicesLoaded = false;
let speechTimeout;

function loadVoices() {
  voices = speechSynthesis.getVoices();
  if(voices.length > 0) {
    femaleVoice = voices.find(v => v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female')) || voices[0];
    maleVoice = voices.find(v => v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Male')) || voices[1] || voices[0];
    voicesLoaded = true;
  }
}
speechSynthesis.onvoiceschanged = loadVoices;

// PAGE NAVIGATION
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function toggleDarkMode() {
  const darkModeBtn = document.getElementById('darkModeBtn');
  isDark =!isDark;
  document.body.classList.toggle('dark-mode');
  if(darkModeBtn) darkModeBtn.textContent = isDark? 'LIGHTMODE' : 'DARKMODE';
}

function toggleFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    if(fullscreenBtn) fullscreenBtn.textContent = 'EXIT FULLSCREEN';
  } else {
    document.exitFullscreen();
    if(fullscreenBtn) fullscreenBtn.textContent = 'FULLSCREEN';
  }
}

function increaseText() {
  if(currentSize < 120) { currentSize += 10; updateScale(); }
}
function decreaseText() {
  if(currentSize > 80) { currentSize -= 10; updateScale(); }
}

function updateScale() {
  document.querySelectorAll('.book-item p').forEach(el => { el.style.fontSize = currentSize + '%'; });
  document.querySelectorAll('.book-item img').forEach(img => {
    img.style.width = (240 * currentSize / 100) + 'px';
    img.style.height = (340 * currentSize / 100) + 'px';
  });
}

function speakSample(text) {
  if('speechSynthesis' in window && voicesLoaded) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = currentRate;
    utterance.voice = selectedGender === 'male'? maleVoice : femaleVoice;
    utterance.pitch = selectedGender === 'male'? 0.9 : 1.1;
    utterance.volume = 2;
    speechSynthesis.speak(utterance);
  }
}

function openBook(bookName) {
  console.log("Opening book:", bookName);
  const container = document.querySelector('.book-container');
  const controls = document.querySelector('.controls-wrapper');
  if(container) container.style.opacity = 0;
  if(controls) controls.style.opacity = 0;
  setTimeout(() => { showPage(bookName + '-poster'); }, 300);
}

window.addEventListener('load', () => {
  const downloadBtn = document.getElementById('downloadBtn');
  if(downloadBtn){ downloadBtn.classList.remove('hidden'); setTimeout(() => { downloadBtn.classList.add('hidden'); }, 10000); }

  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  if(speedSlider && speedValue){
    speedSlider.addEventListener('input', () => {
      currentRate = speedSlider.value;
      speedValue.textContent = currentRate + 'x';
      clearTimeout(speechTimeout);
      speechTimeout = setTimeout(() => { if(voicesLoaded) speakSample('Voice speed test'); }, 200);
    });
  }

  const darkModeBtn = document.getElementById('darkModeBtn');
  if(darkModeBtn){ darkModeBtn.addEventListener('click', toggleDarkMode); }

  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if(fullscreenBtn){ fullscreenBtn.addEventListener('click', toggleFullscreen); }
  document.addEventListener('fullscreenchange', () => {
    if(fullscreenBtn &&!document.fullscreenElement) { fullscreenBtn.textContent = 'FULLSCREEN'; }
  });

  const textIncrease = document.getElementById('textIncrease');
  const textDecrease = document.getElementById('textDecrease');
  if(textIncrease){ textIncrease.addEventListener('click', increaseText); }
  if(textDecrease){ textDecrease.addEventListener('click', decreaseText); }

  const voiceIconBtn = document.getElementById('voiceIconBtn');
  const voicePopup = document.getElementById('voicePopup');
  const currentVoiceIcon = document.getElementById('currentVoiceIcon');
  if(voiceIconBtn && voicePopup){
    voiceIconBtn.addEventListener('click', () => { voicePopup.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => {
      if(!voiceIconBtn.contains(e.target) &&!voicePopup.contains(e.target)) { voicePopup.classList.add('hidden'); }
    });
  }
  document.querySelectorAll('.voice-list button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGender = btn.getAttribute('data-gender');
      if(currentVoiceIcon){
        if(selectedGender === 'male') { currentVoiceIcon.className = 'gender-badge male'; currentVoiceIcon.textContent = '👨'; }
        else { currentVoiceIcon.className = 'gender-badge female'; currentVoiceIcon.textContent = '👩'; }
      }
      if(voicePopup) voicePopup.classList.add('hidden');
    });
  });

  document.addEventListener('keydown', (e) => {
    if(e.target.tagName === 'INPUT') return;
    if(e.key.toLowerCase() === 'd') toggleDarkMode();
    if(e.key.toLowerCase() === 'f') toggleFullscreen();
    if(e.key === 'Escape' && document.fullscreenElement) toggleFullscreen();
    if(e.key === '+') increaseText();
    if(e.key === '-') decreaseText();
  });

  // CLICK BOOK SA LIBRARY > GO TO POSTER
  document.querySelectorAll('.book-item').forEach(book => {
    book.addEventListener('click', () => {
      let bookName = book.dataset.book;
      openBook(bookName);
    });
  });

  // CLICK BACK BUTTON > BALIK LIBRARY
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showPage('library-page');
      const container = document.querySelector('.book-container');
      const controls = document.querySelector('.controls-wrapper');
      if(container) container.style.opacity = 1;
      if(controls) controls.style.opacity = 1;
    });
  });

  loadVoices();
  setTimeout(loadVoices, 500);
});

// CLICK START READING > GO TO READER
document.querySelectorAll('.start-reading').forEach(btn => {
  btn.addEventListener('click', () => {
    let bookName = btn.dataset.book;
    showPage(bookName + '-reader'); 
  });
});

// CLICK BACK SA READER > BALIK POSTER
document.querySelectorAll('.reader-back').forEach(btn => {
  btn.addEventListener('click', () => {
    let currentReader = btn.closest('.page').id;
    let bookName = currentReader.replace('-reader', '');
    showPage(bookName + '-poster'); 
  });
});

// READ ALOUD - MAY CHECK PARA DI MAG ERROR
const readBtn = document.getElementById('readAloudBtn');
if(readBtn){
  readBtn.addEventListener('click', () => {
    let text = document.querySelector('#emily-reader .reader-content').innerText;
    speakSample(text);
  });
}

// BOOK DATA - 10 PAGES EACH. IKaw na maglalagay ng text
const bookPages = {
  'emily': [
`WHEN Miss Emily Grierson died, our whole town went to her funeral: the men through a sort of respectful affection for a fallen monument, the women mostly out of curiosity to see the inside of her house, which no one save an old man-servant--a combined gardener and cook--had seen in at least ten years.

    It was a big, squarish frame house that had once been white, decorated with cupolas and spires and scrolled balconies in the heavily lightsome style of the seventies, set on what had once been our most select street. But garages and cotton gins had encroached and obliterated even the august names of that neighborhood; only Miss Emily's house was left, lifting its stubborn and coquettish decay above the cotton wagons and the gasoline pumps-an eyesore among eyesores. And now Miss Emily had gone to join the representatives of those august names where they lay in the cedar-bemused cemetery among the ranked and anonymous graves of Union and Confederate soldiers who fell at the battle of Jefferson.

Alive, Miss Emily had been a tradition, a duty, and a care; a sort of hereditary obligation upon the town, dating from that day in 1894 when Colonel Sartoris, the mayor--he who fathered the edict that no Negro woman should appear on the streets without an apron-remitted her taxes, the dispensation dating from the death of her father on into perpetuity. Not that Miss Emily would have accepted charity. Colonel Sartoris invented an involved tale to the effect that Miss Emily's father had loaned money to the town, which the town, as a matter of business, preferred this way of repaying. Only a man of Colonel Sartoris' generation and thought could have invented it, and only a woman could have believed it.`, // Paste mo dito yung text
`When the next generation, with its more modern ideas, became mayors and aldermen, this arrangement created some little dissatisfaction. On the first of the year they mailed her a tax notice. February came, and there was no reply. They wrote her a formal letter, asking her to call at the sheriff's office at her convenience. A week later the mayor wrote her himself, offering to call or to send his car for her, and received in reply a note on paper of an archaic shape, in a thin, flowing calligraphy in faded ink, to the effect that she no longer went out at all. The tax notice was also enclosed, without comment.

    They called a special meeting of the Board of Aldermen. A deputation waited upon her, knocked at the door through which no visitor had passed since she ceased giving china-painting lessons eight or ten years earlier. They were admitted by the old Negro into a dim hall from which a stairway mounted into still more shadow. It smelled of dust and disuse--a close, dank smell. The Negro led them into the parlor. It was furnished in heavy, leather-covered furniture. When the Negro opened the blinds of one window, they could see that the leather was cracked; and when they sat down, a faint dust rose sluggishly about their thighs, spinning with slow motes in the single sun-ray. On a tarnished gilt easel before the fireplace stood a crayon portrait of Miss Emily's father.

They rose when she entered--a small, fat woman in black, with a thin gold chain descending to her waist and vanishing into her belt, leaning on an ebony cane with a tarnished gold head. Her skeleton was small and spare; perhaps that was why what would have been merely plumpness in another was obesity in her. She looked bloated, like a body long submerged in motionless water, and of that pallid hue. Her eyes, lost in the fatty ridges of her face, looked like two small pieces of coal pressed into a lump of dough as they moved from one face to another while the visitors stated their errand.`,
`She did not ask them to sit. She just stood in the door and listened quietly until the spokesman came to a stumbling halt. Then they could hear the invisible watch ticking at the end of the gold chain. Her voice was dry and cold. "I have no taxes in Jefferson. Colonel Sartoris explained it to me. Perhaps one of you can gain access to the city records and satisfy yourselves."

    "But we have. We are the city authorities, Miss Emily. Didn't you get a notice from the sheriff, signed by him?"
    
    "I received a paper, yes," Miss Emily said. "Perhaps he considers himself the sheriff . . . I have no taxes in Jefferson."
    
    "But there is nothing on the books to show that, you see We must go by the--"

    "See Colonel Sartoris. I have no taxes in Jefferson."

    "But, Miss Emily--"

"See Colonel Sartoris." (Colonel Sartoris had been dead almost ten years.) "I have no taxes in Jefferson. Tobe!" The Negro appeared. "Show these gentlemen out."`,
`So SHE vanquished them, horse and foot, just as she had vanquished their fathers thirty years before about the smell.

    That was two years after her father's death and a short time after her sweetheart--the one we believed would marry her --had deserted her. After her father's death she went out very little; after her sweetheart went away, people hardly saw her at all. A few of the ladies had the temerity to call, but were not received, and the only sign of life about the place was the Negro man--a young man then-- going in and out with a market basket.

    "Just as if a man--any man--could keep a kitchen properly, "the ladies said; so they were not surprised when the smell developed. It was another link between the gross, teeming world and the high and mighty Griersons.

    A neighbor, a woman, complained to the mayor, Judge Stevens, eighty years old.

    "But what will you have me do about it, madam?" he said.

"Why, send her word to stop it," the woman said. "Isn't there a law? "`,
`"I'm sure that won't be necessary," Judge Stevens said. "It's probably just a snake or a rat that nigger of hers killed in the yard. I'll speak to him about it." The next day he received two more complaints, one from a man who came in diffident deprecation.

    "We really must do something about it, Judge. I'd be the last one in the world to bother Miss Emily, but we've got to do something." That night the Board of Aldermen met--three graybeards and one younger man, a member of the rising generation.

    "It's simple enough," he said. "Send her word to have her place cleaned up. Give her a certain time to do it in, and if she don't. .."

"Dammit, sir," Judge Stevens said, "will you accuse a lady to her face of smelling bad?" 

So the next night, after midnight, four men crossed Miss Emily's lawn and slunk about the house like burglars, sniffing along the base of the brickwork and at the cellar openings while one of them performed a regular sowing motion with his hand out of a sack slung from his shoulder. They broke open the cellar door and sprinkled lime there, and in all the outbuildings. As they recrossed the lawn, a window that had been dark was lighted and Miss Emily sat in it, the light behind her, and her upright torso motionless as that of an idol. They crept quietly across the lawn and into the shadow of the locusts that lined the street. After a week or two the smell went away.`,
`That was when people had begun to feel really sorry for her. People in our town, remembering how old lady Wyatt, her great-aunt, had gone completely crazy at last, believed that the Griersons held themselves a little too high for what they really were. None of the young men were quite good enough for Miss Emily and such. We had long thought of them as a tableau, Miss Emily a slender figure in white in the background, her father a spraddled silhouette in the foreground, his back to her and clutching a horsewhip, the two of them framed by the back-flung front door. So when she got to be thirty and was still single, we were not pleased exactly, but vindicated; even with insanity in the family she wouldn't have turned down all of her chances if they had really materialized.

When her father died, it got about that the house was all that was left to her; and in a way, people were glad. At last they could pity Miss Emily. Being left alone, and a pauper, she had become humanized. Now she too would know the old thrill and the old despair of a penny more or less.`,
`The day after his death all the ladies prepared to call at the house and offer condolence and aid, as is our custom Miss Emily met them at the door, dressed as usual and with no trace of grief on her face. She told them that her father was not dead. She did that for three days, with the ministers calling on her, and the doctors, trying to persuade her to let them dispose of the body. Just as they were about to resort to law and force, she broke down, and they buried her father quickly.

We did not say she was crazy then. We believed she had to do that. We remembered all the young men her father had driven away, and we knew that with nothing left, she would have to cling to that which had robbed her, as people will.`,
`SHE WAS SICK for a long time. When we saw her again, her hair was cut short, making her look like a girl, with a vague resemblance to those angels in colored church windows--sort of tragic and serene.

    The town had just let the contracts for paving the sidewalks, and in the summer after her father's death they began the work. The construction company came with riggers and mules and machinery, and a foreman named Homer Barron, a Yankee--a big, dark, ready man, with a big voice and eyes lighter than his face. The little boys would follow in groups to hear him cuss the riggers, and the riggers singing in time to the rise and fall of picks. Pretty soon he knew everybody in town. Whenever you heard a lot of laughing anywhere about the square, Homer Barron would be in the center of the group. Presently we began to see him and Miss Emily on Sunday afternoons driving in the yellow-wheeled buggy and the matched team of bays from the livery stable.

At first we were glad that Miss Emily would have an interest, because the ladies all said, "Of course a Grierson would not think seriously of a Northerner, a day laborer." But there were still others, older people, who said that even grief could not cause a real lady to forget noblesse oblige- -`,
`without calling it noblesse oblige. They just said, "Poor Emily. Her kinsfolk should come to her." She had some kin in Alabama; but years ago her father had fallen out with them over the estate of old lady Wyatt, the crazy woman, and there was no communication between the two families. They had not even been represented at the funeral.

And as soon as the old people said, "Poor Emily," the whispering began. "Do you suppose it's really so?" they said to one another. "Of course it is. What else could . . ." This behind their hands; rustling of craned silk and satin behind jalousies closed upon the sun of Sunday afternoon as the thin, swift clop- clop-clop of the matched team passed: "Poor Emily."

She carried her head high enough--even when we believed that she was fallen. It was as if she demanded more than ever the recognition of her dignity as the last Grierson; as if it had wanted that touch of earthiness to reaffirm her imperviousness. Like when she bought the rat poison, the arsenic. That was over a year after they had begun to say "Poor Emily," and while the two female cousins were visiting her.`,
    `The End.`
  ],

  'hour': [
    `Page 1: Knowing that Mrs. Mallard was afflicted with a heart trouble...`,
    `Page 2: PASTE`,
    `Page 3: PASTE`,
    `Page 4: PASTE`,
    `Page 5: PASTE`,
    `Page 6: PASTE`,
    `Page 7: PASTE`,
    `Page 8: PASTE`,
    `Page 9: PASTE`,
    `Page 10: PASTE`
  ],
  'magi': [
    `Page 1: One dollar and eighty-seven cents. That was all...`,
    `Page 2: PASTE`,
    `Page 3: PASTE`,
    `Page 4: PASTE`,
    `Page 5: PASTE`,
    `Page 6: PASTE`,
    `Page 7: PASTE`,
    `Page 8: PASTE`,
    `Page 9: PASTE`,
    `Page 10: PASTE`
  ]
};

let currentBook = '';
let currentPage = 0;

// WAIT MUNA NA MAG LOAD LAHAT NG HTML
document.addEventListener('DOMContentLoaded', () => {

let currentFontSize = 18; // default size

const increaseBtn = document.getElementById('increaseFontBtn');
const decreaseBtn = document.getElementById('decreaseFontBtn');
const textArea = document.getElementById('readerText');

function updateFontSize() {
  document.getElementById('readerText').style.fontSize = currentFontSize + 'px';
}

increaseBtn.addEventListener('click', () => {
  if(currentFontSize < 28) { // max 28px
    currentFontSize += 2;
    updateFontSize();
  }
});

decreaseBtn.addEventListener('click', () => {
  if(currentFontSize > 12) { // min 12px
    currentFontSize -= 2;
    updateFontSize();
  }
});

// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (e) => {
  if(e.key === '+' || e.key === '=') { // + key
    increaseBtn.click();
  }
  if(e.key === '-' || e.key === '_') { // - key
    decreaseBtn.click();
  }
});

  // NEXT BUTTON - MAY CHECK
  const nextBtn = document.getElementById('nextPageBtn');
  if(nextBtn){
    nextBtn.addEventListener('click', () => {
      if(currentPage < 9) {
        loadPage(currentBook, currentPage + 1);
      }
    });
  }

  // PREV BUTTON - MAY CHECK
  const prevBtn = document.getElementById('prevPageBtn');
  if(prevBtn){
    prevBtn.addEventListener('click', () => {
      if(currentPage > 0) {
        loadPage(currentBook, currentPage - 1);
      }
    });
  }

  // READ ALOUD BUTTON - MAY CHECK
  const readBtn = document.getElementById('readAloudBtn');
  if(readBtn){
    readBtn.addEventListener('click', () => {
      let text = bookPages[currentBook][currentPage];
      speakSample(text);
    });
  }

});

// FUNCTION PARA MAGPALIT NG PAGE
function loadPage(book, pageNum) {
  currentBook = book;
  currentPage = pageNum;

  const textArea = document.getElementById('readerText');
  const pageNumSpan = document.getElementById('pageNumber');

  // FORCE SET
  textArea.innerText = bookPages[currentBook][pageNum];
  textArea.style.color = document.body.classList.contains('dark-mode')? '#eee' : '#222';

  pageNumSpan.innerText = `Page ${pageNum + 1}/10`;

  // BUTTONS
  document.getElementById('prevPageBtn').style.display = (pageNum === 0)? 'none' : 'inline-block';
  document.getElementById('nextPageBtn').style.display = (pageNum === 9)? 'none' : 'inline-block';
}

// PAG CLICK START READING
document.querySelectorAll('.start-reading').forEach(btn => {
  btn.addEventListener('click', () => {
    let bookName = btn.dataset.book;
    showPage(bookName + '-reader');
    setTimeout(() => { // delay para sure na load na yung page
      loadPage(bookName, 0);
    }, 100);
  });
});

// PREV BUTTON
document.getElementById('prevPageBtn').addEventListener('click', () => {
  if(currentPage > 0) {
    loadPage(currentBook, currentPage - 1);
  }
});

// READ ALOUD BUTTON
document.getElementById('readAloudBtn').addEventListener('click', () => {
  let text = bookPages[currentBook][currentPage];
  speakSample(text); // ginagamit natin yung voice mo kanina
});

// PAG BACK SA POSTER IRESET SA PAGE 1
document.querySelectorAll('.reader-back').forEach(btn => {
  btn.addEventListener('click', () => {
    let currentReader = btn.closest('.page').id;
    let bookName = currentReader.replace('-reader', '');
    showPage(bookName + '-poster');
  });
});

function goHome() {
  document.getElementById('library').style.display = 'block';
  document.getElementById('reader').style.display = 'none';
}

// FONT SIZE
let currentFontSize = 18; 
const minFontSize = 14;
const maxFontSize = 28;

// BACK BUTTON - balik sa library
function goHome() {
  document.getElementById('library').style.display = 'block';
  document.getElementById('reader').style.display = 'none';
}

// A+ BUTTON
function increaseFontSize() {
  if (currentFontSize < maxFontSize) {
    currentFontSize += 2;
    document.getElementById('readerText').style.fontSize = currentFontSize + 'px';
  }
}

// A- BUTTON
function decreaseFontSize() {
  if (currentFontSize > minFontSize) {
    currentFontSize -= 2;
    document.getElementById('readerText').style.fontSize = currentFontSize + 'px';
  }
}