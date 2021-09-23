import { html, TemplateResult } from 'lit-element';
import { get } from 'lit-translate';

import {
  cloneElement,
  EditorAction,
  getChildElementsByTagName,
  getValue,
  identity,
  newWizardEvent,
  SCLTag,
  selector,
  tags,
  Wizard,
  WizardActor,
  WizardInput,
} from '../../foundation.js';
import { emptyWizard, wizards } from '../wizard-library.js';

import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { SingleSelectedEvent } from '@material/mwc-list/mwc-list-foundation';

export function updateNamingAction(element: Element): WizardActor {
  return (inputs: WizardInput[]): EditorAction[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc')
    )
      return [];

    const newElement = cloneElement(element, { name, desc });

    return [{ old: { element }, new: { element: newElement } }];
  };
}

export function selectElementWizard(parent: Element, tagName: SCLTag): Wizard {
  const elements = getChildElementsByTagName(parent, tagName);

  return [
    {
      title: get('wizard.title.select', { tagName: tagName }),
      content: [
        html`<filtered-list
          @selected=${(e: SingleSelectedEvent) => {
            const elementIdentity = (<ListItem>(<List>e.target).selected).value;
            const element = parent.querySelector<Element>(
              selector(tagName, elementIdentity)
            );
            if (element) {
              const wizard = wizards[tagName].edit(element);

              e.target!.dispatchEvent(newWizardEvent(wizard));
              e.target!.dispatchEvent(newWizardEvent());
            }
          }}
          >${elements.map(
            element =>
              html`<mwc-list-item twoline value="${identity(element)}"
                ><span>${element.getAttribute('name')}</span
                ><span slot="secondary"
                  >${identity(element)}</span
                ></mwc-list-item
              >`
          )}</filtered-list
        >`,
      ],
    },
  ];
}

export function renderChildElements(element: Element): TemplateResult[] {
  const elementChildren = tags[<SCLTag>element.tagName].children;

  return elementChildren
    .filter(child => wizards[child].select !== emptyWizard)
    .map(
      child =>
        html`<mwc-button
          @click=${(e: Event) => {
            const wizard = wizards[child].select(element);
            if (wizard) e.target!.dispatchEvent(newWizardEvent(wizard));
            e.target!.dispatchEvent(newWizardEvent());
          }}
          >${child}</mwc-button
        >`
    );
}
