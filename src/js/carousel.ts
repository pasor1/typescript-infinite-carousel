
class Carousel {
  private containerSelector: string;
  private fetchCards: Function;
  private icon: string;
  private title: string;
  private subtitle: string;
  private cardWidth: number;
  private cardHeight: number;
  private cardGutter: number;
  private imgHeight: number;
  private stepSize: number;
  private chunkSize: number;
  private sliderPosition: number;
  private mainContainer: HTMLElement;
  private controlPrevious: HTMLElement;
  private controlNext: HTMLElement;
  private cardsScrollContainer: HTMLElement;
  private cardsScroll: HTMLElement;

  constructor(options: {
    container: string;
    fetchCards: Function;
    icon?: string;
    title?: string;
    subtitle?: string;
    cardWidth?: number;
    cardHeight?: number;
    cardGutter?: number;
    imgHeight?: number;
  }) {
    const defaultSettings = {
      icon: 'tungsten',
      title: '',
      subtitle: '',
      cardWidth: 200,
      cardGutter: 10,
      cardHeight: 240,
      imgHeight: 100,
      ...options
    };

    this.containerSelector = defaultSettings.container;
    this.fetchCards = defaultSettings.fetchCards;
    this.icon = defaultSettings.icon;
    this.title = defaultSettings.title;
    this.subtitle = defaultSettings.subtitle;
    this.cardWidth = defaultSettings.cardWidth;
    this.cardGutter = defaultSettings.cardGutter;
    this.cardHeight = defaultSettings.cardHeight;
    this.imgHeight = defaultSettings.imgHeight;
    this.stepSize = this.cardWidth + (this.cardGutter * 2);
    this.chunkSize = 6;
    this.sliderPosition = 0;

    const carouselTemplate = `
      <div class="header">
        <div>
          <div class="icon">
            <span class="material-icons">${this.icon}</span>
          </div>
        </div>
        <div>
          <h2 class="title">
            ${this.title} <span class="material-icons">chevron_right</span>
          </h2>
          <p class="subtitle">
            ${this.subtitle}
          </p>
        </div>
      </div>
      <div class="cards-container" style="height: ${this.cardHeight + 20}px">
        <div class="cards-scroll">
        </div>
        <a class="previous hidden" href="javascript:;" title="Previous cards" style="height: ${this.cardHeight + 16}px">
          <span class="material-icons">chevron_left</span>
        </a>
        <a class="next hidden" href="javascript:;" title="Next cards" style="height: ${this.cardHeight + 16}px">
          <span class="material-icons">chevron_right</span>
        </a>
      </div>
    `;

    this.mainContainer = document.querySelector(`#${this.containerSelector}`) as HTMLElement;
    this.mainContainer.classList.add('carousel');
    this.mainContainer.innerHTML = carouselTemplate;

    this.controlPrevious = document.querySelector(`#${this.containerSelector} .previous`) as HTMLElement;
    this.controlNext = document.querySelector(`#${this.containerSelector} .next`) as HTMLElement;
    this.cardsScrollContainer = document.querySelector(`#${this.containerSelector} .cards-container`) as HTMLElement;
    this.cardsScroll = document.querySelector(`#${this.containerSelector} .cards-scroll`) as HTMLElement;

    this.mainContainer.addEventListener('mouseenter', () => this.showControls());
    this.mainContainer.addEventListener('mouseleave', () => this.hideControls());
    this.controlPrevious.addEventListener('mousedown', () => this.scrollPrevious());
    this.controlNext.addEventListener('mousedown', () => this.scrollNext());

    this.appendCards(this.chunkSize);
  }


  showControls() {
    this.sliderPosition > 0
      ? this.showControlPrevious(true)
      : this.showControlPrevious(false);
    this.showControlNext(true);
  }


  hideControls() {
    this.showControlPrevious(false);
    this.showControlNext(false);
  }


  showControlPrevious(status: boolean) {
    status === true
      ? this.controlPrevious.classList.remove('hidden')
      : this.controlPrevious.classList.add('hidden');
  }


  showControlNext(status: boolean) {
    status === true
      ? this.controlNext.classList.remove('hidden')
      : this.controlNext.classList.add('hidden');
  }


  scrollPrevious() {
    if (this.sliderPosition > 0) {
      this.sliderPosition--;
      this.cardsScroll.style.left = `-${this.sliderPosition * this.stepSize}px`;
    }
    this.showControls();
  }


  scrollNext() {
    this.appendActivator();
    this.sliderPosition++;
    this.cardsScroll.style.left = `-${this.sliderPosition * this.stepSize}px`;
    this.showControls();
  }


  appendActivator() {
    const offsetRight = this.cardsScroll.offsetWidth - this.cardsScrollContainer.offsetWidth + this.cardsScroll.offsetLeft;
    if (offsetRight - this.stepSize < 0) {
      this.appendCards();
    }
  }


  showLoader(status: boolean) {
    if (status === true) {
      const placeholderCardTemplate = `
      <div class="card loader" style="width: ${this.cardWidth}px; height:${this.cardHeight}px; margin: 0 ${this.cardGutter}px;">
        <div class="img placeholder" style="height: ${this.imgHeight}px">
        </div>
        <div class="caption" style="height: ${this.cardHeight - this.imgHeight}px;">
          <div class="placeholder" style="width:100%"></div>
          <div class="placeholder" style="width:40%"></div>
          <div class="placeholder" style="width:80%"></div>
        </div>
      </div>
    `;
      let loader = '';
      for (let i = 0; i < this.chunkSize; i++) {
        loader += placeholderCardTemplate
      }
      this.cardsScroll.innerHTML += loader;
    } else if (status === false) {
      document.querySelectorAll(`#${this.containerSelector} .card.loader`).forEach(element => element.remove());
    }
  }


  appendCards(cardsNum?: number) {
    const cardTemplate = (card: {
      image: string,
      type: contentType,
      duration: number,
      title: string,
      cardinality: string
    }) => `
    <div>
      <div class="card" style="width: ${this.cardWidth}px; height:${this.cardHeight}px; margin: 0 ${this.cardGutter}px;">
        <div class="img" style="height: ${this.imgHeight}px; background-image: url('${card.image}');">
          <div class="type">${contentTypesMap[card.type]}</div>
          <div class="duration">${toReadableDuration(card.duration)}</div>
        </div>
        <div class="caption" style="height: ${this.cardHeight - this.imgHeight}px;">
          ${card.title}
        </div>
      </div>
      ${card.cardinality === 'collection'
        ? `
          <div class="collection" style="margin: -5px ${this.cardGutter}px;">
            <div class="sublayer level1">
            </div>
            <div class="sublayer level2">
            </div>
          </div>
        `
        : ''}
      </div>
    `;

    type contentType = 'video' | 'elearning' | 'learning_plan' | 'playlist';
    const contentTypesMap = {
      'video': 'VIDEO',
      'elearning': 'ELEARNING',
      'learning_plan': 'LEARNING PLAN',
      'playlist': 'PLAYLIST',
    }

    const toReadableDuration = (duration: number) => {
      const hours = Math
        .floor(duration / 3600).toString()
      const minutes = Math
        .floor((duration % 3600) / 60)
        .toString();
      const seconds = (duration % 60).toString()
        .padStart(2, '0');
      if (duration >= 3600) {
        return `${hours}h ${minutes}min`
      }
      return `${minutes}:${seconds}`
    }

    this.showLoader(true);

    this.fetchCards(cardsNum)
      .then((response: []) => {
        this.showLoader(false);
        const newCards = response.reduce((acc, curr) => {
          return acc + cardTemplate(curr)
        }, this.cardsScroll.innerHTML);
        this.cardsScroll.innerHTML = newCards;
        this.appendActivator();
      });
  }
}