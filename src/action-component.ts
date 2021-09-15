import {
  css,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';

@customElement('action-component')
export class ActionComponent extends LitElement {
  @property({ type: String })
  icon = '';

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium';

  render(): TemplateResult {
    return html`<div class="container ${this.size}" tabindex="0">
      <mwc-icon class="icon ${this.size}">${this.icon}</mwc-icon>
    </div>`;
  }

  static styles = css`
    .container {
      color: var(--mdc-theme-on-surface);
      margin: auto;
      position: relative;
      transition: all 200ms linear;
    }

    .container:focus {
      outline: none;
    }

    .container.large {
      width: 80px;
      height: 80px;
    }

    .container.medium {
      width: 64px;
      height: 64px;
    }

    .container.small {
      width: 50px;
      height: 50px;
    }

    .icon {
      color: var(--mdc-theme-on-surface);
      transition: transform 150ms linear, box-shadow 200ms linear;
      outline-color: var(--mdc-theme-primary);
      outline-style: solid;
      outline-width: 0px;
    }

    .icon.large {
      --mdc-icon-size: 80px;
    }

    .icon.medium {
      --mdc-icon-size: 64px;
    }

    .icon.small {
      --mdc-icon-size: 50px;
    }

    .container:hover > .icon {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    .container:focus-within > .icon {
      outline: 2px solid var(--mdc-theme-primary);
      background: var(--mdc-theme-on-primary);
      transform: scale(0.8);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }
  `;
}
