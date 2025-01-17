import { html, TemplateResult } from 'lit-html';
import { get, translate } from 'lit-translate';

import {
  cloneElement,
  createElement,
  EditorAction,
  getReference,
  getValue,
  isPublic,
  newActionEvent,
  newWizardEvent,
  SCLTag,
  Wizard,
  WizardActor,
  WizardInput,
} from '../foundation.js';

import { getValAction, wizardContent } from './abstractda.js';
import { functionalConstraintEnum } from './foundation/enums.js';

export function renderDa(
  fc: string,
  dchg: string | null,
  qchg: string | null,
  dupd: string | null
): TemplateResult[] {
  return [
    html`<wizard-select
      label="fc"
      .maybeValue=${fc}
      helper="${translate('scl.fc')}"
      required
      fixedMenuPosition
      >${functionalConstraintEnum.map(
        fcOption =>
          html`<mwc-list-item value="${fcOption}">${fcOption}</mwc-list-item>`
      )}</wizard-select
    >`,
    html`<wizard-select
      label="dchg"
      .maybeValue=${dchg}
      helper="${translate('scl.valImport')}"
      nullable
      required
      fixedMenuPosition
      >${['true', 'false'].map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
    html`<wizard-select
      label="qchg"
      .maybeValue=${qchg}
      helper="${translate('scl.valImport')}"
      nullable
      required
      fixedMenuPosition
      >${['true', 'false'].map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
    html`<wizard-select
      label="dupd"
      .maybeValue=${dupd}
      helper="${translate('scl.valImport')}"
      nullable
      required
      fixedMenuPosition
      >${['true', 'false'].map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
  ];
}

export function updateDaAction(element: Element): WizardActor {
  return (inputs: WizardInput[]): EditorAction[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const bType = getValue(inputs.find(i => i.label === 'bType')!)!;
    const type =
      bType === 'Enum' || bType === 'Struct'
        ? getValue(inputs.find(i => i.label === 'type')!)
        : null;
    const sAddr = getValue(inputs.find(i => i.label === 'sAddr')!);
    const valKind = getValue(inputs.find(i => i.label === 'valKind')!);
    const valImport = getValue(inputs.find(i => i.label === 'valImport')!);
    const valField = inputs.find(
      i => i.label === 'Val' && i.style.display !== 'none'
    );
    const Val = valField ? getValue(valField) : null;

    const fc = getValue(inputs.find(i => i.label === 'fc')!) ?? '';
    const dchg = getValue(inputs.find(i => i.label === 'dchg')!);
    const qchg = getValue(inputs.find(i => i.label === 'qchg')!);
    const dupd = getValue(inputs.find(i => i.label === 'dupd')!);

    let daAction: EditorAction | null;
    let valAction: EditorAction | null;

    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc') &&
      bType === element.getAttribute('bType') &&
      type === element.getAttribute('type') &&
      sAddr === element.getAttribute('sAddr') &&
      valKind === element.getAttribute('valKind') &&
      valImport === element.getAttribute('valImprot') &&
      fc === element.getAttribute('fc') &&
      dchg === element.getAttribute('dchg') &&
      qchg === element.getAttribute('qchg') &&
      dupd === element.getAttribute('dupd')
    ) {
      daAction = null;
    } else {
      const newElement = cloneElement(element, {
        name,
        desc,
        bType,
        type,
        sAddr,
        valKind,
        valImport,
        fc,
        dchg,
        qchg,
        dupd,
      });
      daAction = { old: { element }, new: { element: newElement } };
    }

    if (Val === (element.querySelector('Val')?.textContent?.trim() ?? null)) {
      valAction = null;
    } else {
      valAction = getValAction(
        element.querySelector('Val'),
        Val,
        daAction?.new.element ?? element
      );
    }

    const actions: EditorAction[] = [];
    if (daAction) actions.push(daAction);
    if (valAction) actions.push(valAction);
    return actions;
  };
}

export function editDAWizard(element: Element): Wizard {
  const doc = element.ownerDocument;

  const name = element.getAttribute('name');
  const desc = element.getAttribute('desc');
  const bType = element.getAttribute('bType') ?? '';
  const type = element.getAttribute('type');
  const sAddr = element.getAttribute('sAddr');
  const Val = element.querySelector('Val')?.innerHTML.trim() ?? null;
  const valKind = element.getAttribute('valKind');
  const valImport = element.getAttribute('valImport');
  const fc = element.getAttribute('fc') ?? '';
  const dchg = element.getAttribute('dchg');
  const qchg = element.getAttribute('qchg');
  const dupd = element.getAttribute('dupd');

  const deleteButton = html`<mwc-button
    icon="delete"
    trailingIcon
    label="${translate('remove')}"
    @click=${(e: MouseEvent) => {
      e.target!.dispatchEvent(newWizardEvent());
      e.target!.dispatchEvent(
        newActionEvent({
          old: {
            parent: element.parentElement!,
            element: element,
            reference: element.nextSibling,
          },
        })
      );
    }}
    fullwidth
  ></mwc-button>`;

  const types = Array.from(doc.querySelectorAll('DAType, EnumType'))
    .filter(isPublic)
    .filter(type => type.getAttribute('id'));

  const data = element.closest('DataTypeTemplates')!;

  return [
    {
      title: get('da.wizard.title.edit'),
      element: element ?? undefined,
      primary: {
        icon: '',
        label: get('save'),
        action: updateDaAction(element),
      },
      content: [
        deleteButton,
        ...wizardContent(
          name,
          desc,
          bType,
          types,
          type,
          sAddr,
          valKind,
          valImport,
          Val,
          data
        ),
        ...renderDa(fc, dchg, qchg, dupd),
      ],
    },
  ];
}

export function createDaAction(parent: Element): WizardActor {
  return (inputs: WizardInput[]): EditorAction[] => {
    const name = getValue(inputs.find(i => i.label === 'name')!)!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const bType = getValue(inputs.find(i => i.label === 'bType')!)!;
    const type =
      bType === 'Enum' || bType === 'Struct'
        ? getValue(inputs.find(i => i.label === 'type')!)
        : null;
    const sAddr = getValue(inputs.find(i => i.label === 'sAddr')!);
    const valKind = getValue(inputs.find(i => i.label === 'valKind')!);
    const valImport = getValue(inputs.find(i => i.label === 'valImport')!);
    const valField = inputs.find(
      i => i.label === 'Val' && i.style.display !== 'none'
    );
    const Val = valField ? getValue(valField) : null;

    const fc = getValue(inputs.find(i => i.label === 'fc')!) ?? '';
    const dchg = getValue(inputs.find(i => i.label === 'dchg')!);
    const qchg = getValue(inputs.find(i => i.label === 'qchg')!);
    const dupd = getValue(inputs.find(i => i.label === 'dupd')!);

    const actions: EditorAction[] = [];

    const element = createElement(parent.ownerDocument, 'DA', {
      name,
      desc,
      bType,
      type,
      sAddr,
      valKind,
      valImport,
      fc,
      dchg,
      qchg,
      dupd,
    });

    if (Val !== null) {
      const valElement = createElement(parent.ownerDocument, 'Val', {});
      valElement.textContent = Val;
      element.appendChild(valElement);
    }

    actions.push({
      new: {
        parent,
        element,
        reference: getReference(parent, <SCLTag>element.tagName),
      },
    });

    return actions;
  };
}

export function createDaWizard(element: Element): Wizard {
  const doc = element.ownerDocument;

  const name = '';
  const desc = null;
  const bType = '';
  const type = null;
  const sAddr = null;
  const Val = null;
  const valKind = null;
  const valImport = null;
  const fc = '';
  const dchg = null;
  const qchg = null;
  const dupd = null;

  const types = Array.from(doc.querySelectorAll('DAType, EnumType'))
    .filter(isPublic)
    .filter(type => type.getAttribute('id'));

  const data = element.closest('DataTypeTemplates')!;

  return [
    {
      title: get('da.wizard.title.edit'),
      primary: {
        icon: '',
        label: get('save'),
        action: createDaAction(element),
      },
      content: [
        ...wizardContent(
          name,
          desc,
          bType,
          types,
          type,
          sAddr,
          valKind,
          valImport,
          Val,
          data
        ),
        ...renderDa(fc, dchg, qchg, dupd),
      ],
    },
  ];
}
