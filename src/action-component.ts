import {
  css,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from 'lit-element';

import {
  circuitBreakerIcon,
  currentTransformerIcon,
  disconnectorIcon,
  earthSwitchIcon,
  generalConductingEquipmentIcon,
  voltageTransformerIcon,
} from './icons.js';


const typeIcons: Partial<Record<string, TemplateResult>> = {
  CBR: circuitBreakerIcon,
  DIS: disconnectorIcon,
  CTR: currentTransformerIcon,
  VTR: voltageTransformerIcon,
  ERS: earthSwitchIcon,
};

function typeStr(condEq: Element): string {
  return condEq.getAttribute('type') === 'DIS' &&
    condEq.querySelector('Terminal')?.getAttribute('cNodeName') === 'grounded'
    ? 'ERS'
    : condEq.getAttribute('type') ?? '';
}

export function typeIcon(condEq: Element): TemplateResult {
  return typeIcons[typeStr(condEq)] ?? generalConductingEquipmentIcon;
}

@customElement('action-component')
export class ActionComponent extends LitElement {
  @property({ type: Element })
  element!: Element;

  @property({type: String})
  icon = '';

  @property({ type: String })
  size: 'small' | 'medium' | 'large' = 'medium';

  @property({type: String})
  name = '';

  @property({type: String})
  trimText: 'left' | 'right' = 'left';

  render(): TemplateResult {
    return html`<div class="container ${this.size}" tabindex="0">
      <mwc-icon-button class="icon ${this.size}" icon="${this.icon}">${this.icon === '' ? typeIcon(this.element) : ''}</mwc-icon-button>
      <slot></slot>
      <h4 class="footer ${this.trimText}">${this.name}</h4>
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

    .container:hover > .icon.small {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    .container:hover > .icon.medium {
      outline: 2px dashed var(--mdc-theme-primary);
      transition: transform 250ms linear, box-shadow 350ms linear;
    }

    .container:focus-within > .icon {
      outline: 2px solid var(--mdc-theme-primary);
      background: var(--mdc-theme-on-primary);
      transform: scale(0.8);
      transition: transform 200ms linear, box-shadow 250ms linear;
    }

    .footer {
      color: var(--mdc-theme-on-surface);
      font-family: 'Roboto', sans-serif;
      font-weight: 300;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
      opacity: 1;
      transition: opacity 200ms linear;
      text-align: center;
    }

    .footer.right {
      direction: rtl;
    }

    ::slotted(mwc-fab) {
      color: var(--mdc-theme-on-surface);
      transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 200ms linear;
      position: absolute;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
    }

    .icon.large + ::slotted(mwc-fab) {
      top: 15px;
      left: 15px;
    }

    .icon.medium + ::slotted(mwc-fab) {
      top: 8px;
      left: 8px;
    }

    .icon.small + ::slotted(mwc-fab) {
      top: 2px;
      left: 2px;
    }

    .container:focus-within > ::slotted(mwc-fab) {
      transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 250ms linear;
      pointer-events: auto;
      opacity: 1;
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(1)) {
      transform: translate(0px, -60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(1)),
    .icon.small + ::slotted(mwc-fab:nth-child(1)) {
      transform: translate(0px, -52px);
    }

    .container:focus-within > .icon.large + ::slotted(mwc-fab:nth-child(2)) {
      transform: translate(0px, 60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(2)),
    .icon.small + ::slotted(mwc-fab:nth-child(2)) {
      transform: translate(0px, 52px);
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(3)) {
      transform: translate(60px, 0px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(3)),
    .icon.small + ::slotted(mwc-fab:nth-child(3)) {
      transform: translate(52px, 0px);
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(4)) {
      transform: translate(-60px, 0px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(4)),
    .icon.small + ::slotted(mwc-fab:nth-child(4)) {
      transform: translate(-52px, 0px);
    }

    .container:focus-within > {
      transform: translate(60px, -60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(5)),
    .icon.small + ::slotted(mwc-fab:nth-child(5)) {
      transform: translate(52px, -52px);
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(6)) {
      transform: translate(-60px, 60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(6)),
    .icon.small + ::slotted(mwc-fab:nth-child(6)) {
      transform: translate(-52px, 52px);
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(7)) {
      transform: translate(-60px, -60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(7)),
    .icon.small + ::slotted(mwc-fab:nth-child(7)) {
      transform: translate(-52px, -52px);
    }

    .container:focus-within > .icon.large  + ::slotted(mwc-fab:nth-child(8)) {
      transform: translate(60px, 60px);
    }

    .container:focus-within > .icon.medium + ::slotted(mwc-fab:nth-child(8)),
    .icon.small + ::slotted(mwc-fab:nth-child(8))
     {
      transform: translate(52px, 52px);
    }

  `;
}
