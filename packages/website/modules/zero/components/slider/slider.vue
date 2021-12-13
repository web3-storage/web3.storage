<template>
  <div class="slider-container">

    <div class="slider">
      <div
        class="slider-row-container"
        ref="rowContainer">
        <div
          class="slider-row"
          :class="{ sliding: animate }"
          :style="{ left: `${left}px`, width: slidingRowWidth }">

          <div
            v-for="(item, index) in collection"
            :key="index"
            :style="{ width: `${columnWidth}px` }"
            class="click-wrapper">

            <slot :name="`column-${index}`"></slot>

          </div>

        </div>
      </div>
    </div>

    <div class="slider-controls">

      <div v-if="arrowSelectors" class="slide-selector">
        <div @click="incrementIndex('down')">
          <slot name="icon-previous"></slot>
        </div>
        <div @click="incrementIndex('up')">
          <slot name="icon-next"></slot>
        </div>
      </div>

      <div v-if="rangeInput" class="slider-range-input">
        <div class="dummy-thumb" :style="`left: ${thumbPosition}px;`">
          <slot name="icon-thumb"></slot>
        </div>
        <input
          ref="sliderInput"
          v-model="range"
          type="range"
          step="0.1"
          :min="indices / 2"
          :max="indices * indices + 1">
      </div>

    </div>

  </div>
</template>

<script>
// =================================================================== Functions
const handleSliderResize = (instance) => {
  matchBreakpointDisplayAmount(instance)
  if (instance.currentIndex > instance.indices) {
    instance.currentIndex = instance.indices
  }
  const columnWidth = instance.$refs.rowContainer.clientWidth / instance.display
  instance.animate = false
  instance.columnWidth = columnWidth
  instance.slidingRowWidth = columnWidth * instance.columns + 'px'
  instance.setSliderPosition()

  if (instance.rangeInput) {
    instance.inputWidth = instance.$refs.sliderInput.getBoundingClientRect().width
  }
}

const matchBreakpointDisplayAmount = (instance) => {
  let reset = true
  for (const breakpoint in instance.visibleColumns) {
    if (window.matchMedia(`(max-width: ${breakpoint})`).matches) {
      if (reset) { reset = false }
      if (instance.display !== instance.visibleColumns[breakpoint]) {
        instance.display = instance.visibleColumns[breakpoint]
      }
    }
  }
  if (reset) {
    if (instance.display !== instance.visibleColumns.default) {
      instance.display = instance.visibleColumns.default
    }
  }
}

// ====================================================================== Export
export default {
  name: 'Slider',

  props: {
    collection: {
      type: Array,
      required: true
    },
    arrowSelectors: {
      type: Boolean,
      required: false,
      default: true
    },
    rangeInput: {
      type: Boolean,
      required: false,
      default: false
    },
    rows: {
      type: Number,
      required: false,
      default: 1
    },
    displayOptions: {
      type: Object,
      required: false,
      default: () => {
        return { default: 3 }
      }
    }
  },

  data () {
    return {
      currentIndex: 0,
      range: 0,
      display: 4,
      columnWidth: 0,
      left: 0,
      slidingRowWidth: '100%',
      inputWidth: false,
      resize: false,
      animate: true
    }
  },

  computed: {
    columns () {
      return Math.ceil(this.collection.length / this.rows)
    },
    indices () {
      return this.columns - this.display
    },
    breakpoints () {
      const data = {}
      if (this.displayOptions.hasOwnProperty('ultralarge')) { data['140.625rem'] = this.displayOptions.ultralarge }
      if (this.displayOptions.hasOwnProperty('xlarge')) { data['90rem'] = this.displayOptions.xlarge }
      if (this.displayOptions.hasOwnProperty('large')) { data['75rem'] = this.displayOptions.large }
      if (this.displayOptions.hasOwnProperty('medium')) { data['64rem'] = this.displayOptions.medium }
      if (this.displayOptions.hasOwnProperty('small')) { data['53.125rem'] = this.displayOptions.small }
      if (this.displayOptions.hasOwnProperty('mini')) { data['40rem'] = this.displayOptions.mini }
      if (this.displayOptions.hasOwnProperty('tiny')) { data['25.9375rem'] = this.displayOptions.tiny }
      if (this.displayOptions.hasOwnProperty('default')) {
        data.default = this.displayOptions.default
      } else {
        data.default = 3
      }
      return data
    },
    visibleColumns () {
      const options = {}
      for (const item in this.breakpoints) {
        options[item] = this.breakpoints[item] > this.columns ? this.columns : this.breakpoints[item]
      }
      return options
    },
    thumbPosition () {
      const pos = (this.range - (this.indices / 2)) / ((this.indices * this.indices + 1) - (this.indices / 2))
      return Math.max(pos * (this.inputWidth - 48), 0)
    }
  },

  watch: {
    range (val) {
      this.animate = true
      const index = Math.trunc((val - (val % this.indices)) / this.indices)
      this.currentIndex = Math.max(0, Math.min(index, this.indices))
      this.setSliderPosition()
    }
  },

  mounted () {
    if (this.columns < this.display) {
      this.display = this.columns
    }
    handleSliderResize(this)
    this.resize = () => { handleSliderResize(this) }
    window.addEventListener('resize', this.resize)
  },

  beforeDestroy () {
    if (this.resize) { window.removeEventListener('resize', this.resize) }
  },

  methods: {
    setSliderPosition () {
      this.left = (-1 * this.currentIndex) * this.columnWidth
    },
    incrementIndex (val) {
      this.animate = true
      if (val === 'up') {
        this.currentIndex = Math.min(this.currentIndex + 1, this.columns - this.display)
      } else {
        this.currentIndex = Math.max(this.currentIndex - 1, 0)
      }
      this.setSliderPosition()
    }
  }
}
</script>

<style lang="scss" scoped>
// ///////////////////////////////////////////////////////////////////// General
.slider {
  overflow: hidden;
}

.slider-row {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  box-sizing: border-box;
  position: relative;
  left: 0px;
}

.slider-row-container {
  width: 100%;
}

.sliding {
  transition: left 300ms ease-in-out;
}

// ////////////////////////////////////////////////////////////// Slider Content
.click-wrapper {
  padding: 1rem;
}

// ///////////////////////////////////////////////////////////// Slider Controls
.slider-range-input {
  position: relative;
  display: block;
  width: 100%;
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 0px;
    border: 1px solid gray;
    transform: translateY(-50);
    border-radius: 10px;
    z-index: -10;
  }
}

// ////////////////////////////////////////////////////////////////////// Inputs
.slide-selector {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
}

.dummy-thumb {
  position: absolute;
  height: 20px;
  width: 50px;
  background-color: #ffffff;
  border: 2px solid gray;
  z-index: -1;
  top: 50%;
  transform: translateY(-50%);
}

@mixin thumb() {
  height: 20px;
  width: 50px;
  cursor: pointer;
  border-radius: 0px;
  background-color: transparent;
  border: 2px solid transparent;
}

input {
  width: 100%;
  &[type=range] {
    height: 28px;
    -webkit-appearance: none;
    margin: 10px 0;
    width: 100%;
    z-index: 10000;
    background-color: transparent;
    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 0px;
      cursor: pointer;
      animate: 0.2s;
      border-radius: 20px;
      background-color: transparent;
      border-color: transparent;
      color: transparent;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      margin-top: -9px;
      @include thumb
    }
    &::-moz-range-track {
      width: 100%;
      height: 0px;
      cursor: pointer;
      animate: 0.2s;
      border-radius: 20px;
      background-color: transparent;
      border-color: transparent;
      color: transparent;
    }
    &::-moz-range-thumb {
      @include thumb
    }
    &::-ms-track {
      width: 100%;
      height: 0px;
      cursor: pointer;
      background-color: transparent;
      border-color: transparent;
      color: transparent;
    }
    &::-ms-fill-upper {
      border-radius: 20px;
    }
    &::-ms-thumb {
      margin-top: 1px;
      @include thumb
    }
  }
}
</style>
