import { Menu } from '@material/mwc-menu';
import {
  css,
  customElement,
  html,
  LitElement,
  property,
  query,
  TemplateResult,
} from 'lit-element';
import { translate } from 'lit-translate';
import { newWizardEvent } from '../foundation.js';
import { wizards } from '../wizards/wizard-library.js';

import { styles } from './foundation.js';

@customElement('function-editor')
export class FunctionEditor extends LitElement {
  @property({ attribute: false })
  element!: Element;
  @property({ type: Boolean })
  readonly = false;

  @property({ type: String })
  get name(): string {
    return this.element.getAttribute('name') ?? '';
  }
  @property({ type: String })
  get desc(): string | null {
    return this.element.getAttribute('desc') ?? null;
  }

  @query('#menu') moreMenu!: Menu;

  openEditWizard(): void {
    const wizard = wizards['Function'].edit(this.element);
    if (wizard) this.dispatchEvent(newWizardEvent(wizard));
  }

  renderHeader(): TemplateResult {
    return html`<h3>
      ${this.name} ${this.desc === null ? '' : html`&mdash;`} ${this.desc}
      ${this.readonly
        ? html``
        : html` <div>
            <mwc-icon-button
              icon="more_vert"
              @click=${() => (this.moreMenu.open = true)}
            ></mwc-icon-button>
            <mwc-menu id="menu">
              <mwc-list-item graphic="icon">
                <span>Logical node</span>
                <mwc-icon slot="graphic">folder</mwc-icon>
              </mwc-list-item>
              <mwc-list-item graphic="icon">
                <span>Logical node</span>
                <mwc-icon slot="graphic">folder</mwc-icon>
              </mwc-list-item>
              <mwc-list-item graphic="icon">
                <span>Logical node</span>
                <mwc-icon slot="graphic">folder</mwc-icon>
              </mwc-list-item>
            </mwc-menu>
          </div>`}
    </h3>`;
  }
  /* 
  <abbr title="${translate('add')}">
              <mwc-icon-button icon="playlist_add"></mwc-icon-button>
            </abbr>
            <nav>
              <abbr title="${translate('lnode.tooltip')}">
                <mwc-icon-button icon="account_tree"></mwc-icon-button>
              </abbr>
              <abbr title="${translate('duplicate')}">
                <mwc-icon-button icon="content_copy"></mwc-icon-button>
              </abbr>
              <abbr title="${translate('edit')}">
                <mwc-icon-button icon="edit"></mwc-icon-button>
              </abbr>
              <abbr title="${translate('remove')}">
                <mwc-icon-button icon="delete"></mwc-icon-button>
              </abbr>
            </nav> */

  render(): TemplateResult {
    return html`<section tabindex="0">
      ${this.renderHeader()}
      <div>
        <div id="ceContainer">
          ${Array.from(
            this.element?.querySelectorAll(
              ':root > Substation > VoltageLevel > Bay > ConductingEquipment'
            ) ?? []
          ).map(
            voltageLevel =>
              html`<conducting-equipment-editor
                .element=${voltageLevel}
                ?readonly=${this.readonly}
              ></conducting-equipment-editor>`
          )}
        </div>
      </div>
    </section> `;
  }

  static styles = css`
    ${styles}

    div {
      float: right;
    }
    mwc-menu {
      position: absolute;
    }
  `;
}
