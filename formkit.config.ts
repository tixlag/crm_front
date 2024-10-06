// formkit.config.ts
import type { DefaultConfigOptions } from '@formkit/vue'
import { createAutoAnimatePlugin } from '@formkit/addons'
import { de, en, ru } from '@formkit/i18n'
import { primeInputs, primeOutputs } from '@sfxcode/formkit-primevue'
import { addPrimeAsteriskPlugin } from '@sfxcode/formkit-primevue/plugins'

const config: DefaultConfigOptions = {
  locales: { ru, en, de },
  // Define the active locale
  locale: 'ru',
  inputs: { ...primeInputs, ...primeOutputs },

  plugins: [
    // createAutoAnimatePlugin(
    //   {
    //     /* optional AutoAnimate config */
    //     // default:
    //     duration: 250,
    //     easing: 'ease-in-out',
    //   },
    //   {
    //     /* optional animation targets object */
    //     // default:
    //     global: ['outer', 'inner'],
    //     form: ['form'],
    //     repeater: ['items'],
    //   },
    // ),
    addPrimeAsteriskPlugin,
  ],
}

export default config
