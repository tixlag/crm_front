<script setup>
import AppConfigurator from './AppConfigurator.vue';

const themeStore = useThemeStore();

const toggleDarkMode = () => {
  if (!document.startViewTransition) {
    executeDarkModeToggle()
    return
  }
  document.startViewTransition(() => executeDarkModeToggle())

  const executeDarkModeToggle = () => {
    themeStore.toggleDarkMode()
    // document.documentElement.classList.toggle('app-dark')
  }
}


</script>
<template>
<div class="layout-config-menu mr-6">
<button type="button" class="layout-topbar-action" @click="toggleDarkMode">
  <i :class="['pi', { 'pi-moon': themeStore.isDarkTheme, 'pi-sun': !themeStore.isDarkTheme }]"></i>
</button>
<div class="relative">
  <button
      v-styleclass="{ selector: '.config-panel', enterFromClass: 'hidden', enterActiveClass: 'my-fadein', leaveActiveClass: 'my-fadeout', leaveToClass: 'hidden', hideOnOutsideClick: true }"
      type="button"
      class="layout-topbar-action layout-topbar-action-highlight"
  >
    <i class="pi pi-palette"></i>
  </button>
  <AppConfigurator />
</div>
</div>
</template>

<style lang="scss" scoped>
@keyframes my-fadein {
  0% {
    max-height: 0;
    opacity: 0;
  }
  100% {
    max-height: 15rem;
    opacity: 1;
  }
}

@keyframes my-fadeout {
  0% {
    max-height: 15rem;
    opacity: 1;
  }
  100% {
    max-height: 0;
    opacity: 0;
  }
}

.my-hidden {
  display: none;
}

.my-fadein {
  animation: my-fadein 150ms linear;
}

.my-fadeout {
  animation: my-fadeout 150ms linear;
}

@mixin focused() {
  outline-width: var(--focus-ring-width);
  outline-style: var(--focus-ring-style);
  outline-color: var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  box-shadow: var(--focus-ring-shadow);
  transition:
      box-shadow var(--transition-duration),
      outline-color var(--transition-duration);
}

@mixin focused-inset() {
  outline-offset: -1px;
  box-shadow: inset var(--focus-ring-shadow);
}
.layout-config-menu {
  display: flex;
  gap: 1rem;
}


.layout-topbar-action {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: var(--text-color-secondary);
  border-radius: 50%;
  border-width: 0;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text-color);
  transition: background-color var(--element-transition-duration);
  cursor: pointer;

  &:hover {
    background-color: var(--surface-hover);
  }

  &:focus-visible {
    @include focused();
  }

  i {
    font-size: 1.25rem;
  }

  span {
    font-size: 1rem;
    display: none;
  }

  &.layout-topbar-action-highlight {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
  }
}
@media (max-width: 991px) {

  .layout-topbar-action {
    display: flex;
    //width: 100%;
    //height: auto;
    justify-content: center;
    border-radius: 50%;
    padding: 0.5rem 1rem;
    border-color: none;

    i {
      font-size: 1rem;
      //margin-right: 0.5rem;
    }

    span {
      font-weight: medium;
      display: block;
    }
  }
}

/*! CSS Used from: https://sakai.primevue.org/assets/index-B718aNbs.css */
.pi{font-family:primeicons;speak:none;font-style:normal;font-weight:400;font-variant:normal;text-transform:none;line-height:1;display:inline-block;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
.pi:before{--webkit-backface-visibility:hidden;backface-visibility:hidden;}
.pi-sun:before{content:"";}
.pi-palette:before{content:"";}
.layout-topbar .layout-topbar-action{display:inline-flex;justify-content:center;align-items:center;color:var(--text-color-secondary);border-radius:50%;width:2.5rem;height:2.5rem;color:var(--text-color);transition:background-color var(--element-transition-duration);cursor:pointer;}
.layout-topbar .layout-topbar-action:hover{background-color:var(--surface-hover);}
.layout-topbar .layout-topbar-action i{font-size:1.25rem;}
.layout-topbar .layout-topbar-action.layout-topbar-action-highlight{background-color:var(--primary-color);color:var(--primary-contrast-color);}
.layout-topbar .layout-config-menu{display:flex;gap:1rem;}
*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb;}
:before,:after{--tw-content:"";}
button{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0;}
button{text-transform:none;}
button{-webkit-appearance:button;background-color:transparent;background-image:none;}
button{cursor:pointer;}
:disabled{cursor:default;}
*,:before,:after{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scroll-snap-strictness:proximity;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;}
</style>