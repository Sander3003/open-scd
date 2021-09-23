import { customElement, html, LitElement, property, TemplateResult } from "lit-element";
import { newWizardEvent } from "../foundation.js";
import { circuitBreakerIcon, voltageTransformerIcon } from "../icons.js";
import { wizards } from "../wizards/wizard-library.js";

@customElement('power-transformer-editor')
export class PowerTransformer extends LitElement {
    @property({ type: Element })
    element!: Element;

    @property({ type: Boolean })
    readonly = false;

    @property({ type: String })
    get name(): string {
        return this.element.getAttribute('name') ?? '';
    }

    onEditWizard(): void {
        const wizard = wizards['PowerTransformer'].edit(this.element);
        if (wizard) this.dispatchEvent(newWizardEvent(wizard));
    }

    render(): TemplateResult {
        return html`
           <action-component name=${this.name} size="large" .icon=${voltageTransformerIcon}>
            <mwc-fab mini icon="edit" @click=${() => this.onEditWizard()}></mwc-fab>
            <mwc-fab mini icon="delete"></mwc-fab>
            <mwc-fab mini icon="account_tree"></mwc-fab>
            <mwc-fab mini icon="forward"></mwc-fab>
           </action-component>
        `;
    }

}