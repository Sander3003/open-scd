import { html, TemplateResult } from 'lit-element';
import { get, translate } from 'lit-translate';
import { createElement, EditorAction, getReference, getValue, Wizard, WizardActor, WizardInput } from '../foundation';
import { updateNamingAction } from './foundation/actions';

function render(name: string | null, desc: string | null): TemplateResult[] {
  return [
    html`<wizard-textfield
      label="name"
      helper="${translate('scl.name')}"
      .maybeValue=${name}
      required
      validationMessage="${translate('textfield.required')}"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      helper="${translate('scl.desc')}"
      .maybeValue=${desc}
      nullable
    ></wizard-textfield>`,
  ];
}

export function editPowerTransformerWizard(element: Element): Wizard | undefined {
    const name = element.getAttribute('name');
    const desc = element.getAttribute('desc');
    return [
    {
        title: get('wizard.title.edit', { tagName: element.tagName }),
        content: render(name, desc),
        primary: {
            label: get('save'),
            icon: 'save',
            action: updateNamingAction(element)
        }
    }
  ];
}

export function createPowerTransformerAction(parent: Element): WizardActor {
    return (inputs: WizardInput[]): EditorAction[] => {
      const name = getValue(inputs.find(i => i.label === 'name')!);
      const desc = getValue(inputs.find(i => i.label === 'desc')!);
      const type = 'PTR';
      const element = createElement(parent.ownerDocument, 'PowerTransformer', {
        name,
        desc,
        type
      });
  
      const action = {
        new: {
          parent,
          element,
          reference: getReference(parent, 'PowerTransformer'),
        },
      };
  
      return [action];
    };
}

export function createPowerTransformerWizard(parent: Element): Wizard | undefined {
    return [
        {
            title: get('wizard.title.create', { tagName: 'PowerTransformer' }),
            content: render('', null),
            primary: {
                label: get('add'),
                icon: 'add',
                action: createPowerTransformerAction(parent)
            }
        }
    ]
}
