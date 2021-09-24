import { html, TemplateResult } from 'lit-element';
import { get, translate } from 'lit-translate';

import {
  createElement,
  EditorAction,
  getReference,
  getValue,
  Wizard,
  WizardActor,
  WizardInput,
} from '../foundation.js';
import {
  renderChildElements,
  selectElementWizard,
} from './foundation/actions.js';

function render(
  name: string | null,
  desc: string | null,
  type: string | null
): TemplateResult[] {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${name}
      helper="${translate('scl.name')}"
      required
      validationMessage="${translate('textfield.required')}"
      dialogInitialFocus
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${desc}
      nullable
      helper="${translate('scl.desc')}"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="type"
      .maybeValue=${type}
      nullable
      helper="${translate('scl.type')}"
    ></wizard-textfield>`,
  ];
}

export function createXxxFunctionAction(parent: Element): WizardActor {
  return (inputs: WizardInput[]): EditorAction[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!);
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const type = getValue(inputs.find(i => i.label === 'type')!);

    const element = createElement(parent.ownerDocument, 'Function', {
      name,
      desc,
      type,
    });

    const action = {
      new: {
        parent,
        element,
        reference: getReference(parent, 'Function'),
      },
    };

    return [action];
  };
}

export function createXxxFunctionWizard(element: Element): Wizard | undefined {
  return [
    {
      title: get('wizard.title.add', { tagName: element.tagName }),
      element: element,
      primary: {
        label: get('add'),
        icon: 'add',
        action: createXxxFunctionAction(element),
      },
      content: render('', null, null),
    },
  ];
}

export function editXxxFunctionWizard(element: Element): Wizard | undefined {
  const name = element.getAttribute('name');
  const desc = element.getAttribute('desc');
  const type = element.getAttribute('type');

  return [
    {
      title: get('wizard.title.edit', { tagName: element.tagName }),
      element: element,
      primary: {
        label: get('save'),
        icon: 'save',
        action: createXxxFunctionAction(element),
      },
      content: [...render(name, desc, type), ...renderChildElements(element)],
    },
  ];
}

export function selectFunctionWizard(parent: Element): Wizard {
  return selectElementWizard(parent, 'Function');
}

export function selectSubFunctionWizard(parent: Element): Wizard {
  return selectElementWizard(parent, 'SubFunction');
}

export function selectEqFunctionWizard(parent: Element): Wizard {
  return selectElementWizard(parent, 'EqFunction');
}

export function selectEqSubFunctionWizard(parent: Element): Wizard {
  return selectElementWizard(parent, 'EqSubFunction');
}
