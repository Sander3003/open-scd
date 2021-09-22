import { css, html, LitElement, property, TemplateResult } from 'lit-element';
import { translate } from 'lit-translate';
import { styles } from './foundation.js';

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

  renderHeader(): TemplateResult {
    return html`<h3>
      ${this.name} ${this.desc === null ? '' : html`&mdash;`} ${this.desc}
      ${this.readonly
        ? html``
        : html`<abbr title="${translate('add')}">
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
            </nav>`}
    </h3>`;
  }

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
  `;
}
