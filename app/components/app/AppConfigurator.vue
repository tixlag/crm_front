<script setup>
import {$dt, $t, updatePreset, updateSurfacePalette} from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import Lara from '@primevue/themes/lara';
import Nora from '@primevue/themes/nora';
// import {useThemesPresets} from "~/composables/theme.js";

const themeStore= useThemeStore();
const preset = ref(themeStore.preset);
const { presetOptions, primaryColors, surfaces} = useThemesPresets();



function updateColors(type, color) {
  themeStore.updateColors(type, color);
}


function onPresetChange() {
  themeStore.setPreset(preset.value);
  // const presetValue = presets[preset.value];
  // const surfacePalette = surfaces.value.find((s) => s.name === themeStore.surface)?.palette;
  themeStore.onPresetChange();
}

</script>

<template>
  <div
      class="config-panel hidden absolute top-[3.25rem] right-0 w-64 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]"
  >
    <div class="flex flex-col gap-4">
      <div>
        <span class="text-sm text-muted-color font-semibold">Primary</span>
        <div class="pt-2 flex gap-2 flex-wrap justify-between">
          <Button
              v-for="primaryColor of primaryColors"
              :key="primaryColor.name"
              type="button"
              :title="primaryColor.name"
              @click="updateColors('primary', primaryColor)"
              :class="['border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1', { 'outline-primary': themeStore.primary === primaryColor.name }]"
              :style="{ backgroundColor: `${primaryColor.name === 'noir' ? 'var(--text-color)' : primaryColor.palette['500']}` }"
          ></Button>
        </div>
      </div>
      <div>
        <span class="text-sm text-muted-color font-semibold">Surface</span>
        <div class="pt-2 flex gap-2 flex-wrap justify-between">
          <Button
              v-for="surface of surfaces"
              :key="surface.name"
              type="button"
              :title="surface.name"
              @click="updateColors('surface', surface)"
              :class="[
                            'border-none w-5 h-5 rounded-full p-0 cursor-pointer outline-none outline-offset-1',
                            { 'outline-primary': themeStore.surface ? themeStore.surface === surface.name : themeStore.darkTheme ? surface.name === 'zinc' : surface.name === 'slate' }
                        ]"
              :style="{ backgroundColor: `${surface.palette['500']}` }"
          ></Button>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-sm text-muted-color font-semibold">Presets</span>
        <SelectButton v-model="preset" @change="onPresetChange" :options="presetOptions" :allowEmpty="false" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/*! CSS Used from: https://sakai.primevue.org/assets/index-B718aNbs.css */
*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb;}
:before,:after{--tw-content:"";}
button{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0;}
button{text-transform:none;}
button{-webkit-appearance:button;background-color:transparent;background-image:none;}
button{cursor:pointer;}
:disabled{cursor:default;}
*,:before,:after{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-scroll-snap-strictness:proximity;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgb(59 130 246 / .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;}
.absolute{position:absolute;}
.right-0{right:0;}
.top-\[3\.25rem\]{top:3.25rem;}
.config-panel{z-index:2;overflow:hidden}
.flex{display:flex;}
.h-5{height:1.25rem;}
.w-5{width:1.25rem;}
.w-64{width:16rem;}
.origin-top{transform-origin:top;}
.cursor-pointer{cursor:pointer;}
.flex-col{flex-direction:column;}
.flex-wrap{flex-wrap:wrap;}
.justify-between{justify-content:space-between;}
.gap-2{gap:.5rem;}
.gap-4{gap:1rem;}
.rounded-full{border-radius:9999px;}
.border{border-width:1px;}
.border-none{border-style:none;}
.bg-surface-0{--tw-bg-opacity:1;background-color:color-mix(in srgb,var(--p-surface-0) calc(100% * var(--tw-bg-opacity)),transparent);}
.p-0{padding:0;}
.p-4{padding:1rem;}
.pt-2{padding-top:.5rem;}
.text-sm{font-size:.875rem;line-height:1.25rem;}
.font-semibold{font-weight:600;}
.shadow-\[0px_3px_5px_rgba\(0\,0\,0\,0\.02\)\,0px_0px_2px_rgba\(0\,0\,0\,0\.05\)\,0px_1px_4px_rgba\(0\,0\,0\,0\.08\)\]{--tw-shadow:0px 3px 5px rgba(0,0,0,.02),0px 0px 2px rgba(0,0,0,.05),0px 1px 4px rgba(0,0,0,.08);--tw-shadow-colored:0px 3px 5px var(--tw-shadow-color), 0px 0px 2px var(--tw-shadow-color), 0px 1px 4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow);}
.outline-none{outline:2px solid transparent;outline-offset:2px;}
.outline-offset-1{outline-offset:1px;}
.outline-primary{outline-color:color-mix(in srgb,var(--p-primary-color) 100%,transparent);}
.border-surface{border-color:var(--p-content-border-color);}
.rounded-border{border-radius:var(--p-content-border-radius);}
.text-muted-color{color:var(--p-text-muted-color);}
/*! CSS Used from: Embedded */
*{box-sizing:border-box;}
.p-component:disabled{opacity:var(--p-disabled-opacity);}
/*! CSS Used from: Embedded */
.p-togglebutton{display:inline-flex;cursor:pointer;user-select:none;align-items:center;justify-content:center;overflow:hidden;position:relative;color:var(--p-togglebutton-color);background:var(--p-togglebutton-background);border:1px solid var(--p-togglebutton-border-color);padding:var(--p-togglebutton-padding);font-size:1rem;font-family:inherit;font-feature-settings:inherit;transition:background var(--p-togglebutton-transition-duration),color var(--p-togglebutton-transition-duration),border-color var(--p-togglebutton-transition-duration),outline-color var(--p-togglebutton-transition-duration),box-shadow var(--p-togglebutton-transition-duration);border-radius:var(--p-togglebutton-border-radius);outline-color:transparent;font-weight:var(--p-togglebutton-font-weight);}
.p-togglebutton-content{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:var(--p-togglebutton-gap);}
.p-togglebutton-label{position:relative;transition:none;}
.p-togglebutton::before{content:"";background:transparent;transition:background var(--p-togglebutton-transition-duration),color var(--p-togglebutton-transition-duration),border-color var(--p-togglebutton-transition-duration),outline-color var(--p-togglebutton-transition-duration),box-shadow var(--p-togglebutton-transition-duration);position:absolute;left:var(--p-togglebutton-content-left);top:var(--p-togglebutton-content-top);width:calc(100% - calc(2 * var(--p-togglebutton-content-left)));height:calc(100% - calc(2 * var(--p-togglebutton-content-top)));border-radius:var(--p-togglebutton-border-radius);}
.p-togglebutton.p-togglebutton-checked::before{background:var(--p-togglebutton-content-checked-background);box-shadow:var(--p-togglebutton-content-checked-shadow);}
.p-togglebutton:not(:disabled):not(.p-togglebutton-checked):hover{background:var(--p-togglebutton-hover-background);color:var(--p-togglebutton-hover-color);}
.p-togglebutton.p-togglebutton-checked{background:var(--p-togglebutton-checked-background);border-color:var(--p-togglebutton-checked-border-color);color:var(--p-togglebutton-checked-color);}
.p-togglebutton:disabled{opacity:1;cursor:default;background:var(--p-togglebutton-disabled-background);border-color:var(--p-togglebutton-disabled-border-color);color:var(--p-togglebutton-disabled-color);}
/*! CSS Used from: Embedded */
.p-selectbutton{display:inline-flex;user-select:none;vertical-align:bottom;outline-color:transparent;border-radius:var(--p-selectbutton-border-radius);}
.p-selectbutton .p-togglebutton{border-radius:0;border-width:1px 1px 1px 0;}
.p-selectbutton .p-togglebutton:first-child{border-left-width:1px;border-top-left-radius:var(--p-selectbutton-border-radius);border-bottom-left-radius:var(--p-selectbutton-border-radius);}
.p-selectbutton .p-togglebutton:last-child{border-top-right-radius:var(--p-selectbutton-border-radius);border-bottom-right-radius:var(--p-selectbutton-border-radius);}
</style>