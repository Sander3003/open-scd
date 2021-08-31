import { html, TemplateResult } from 'lit-element';
import { get, translate } from 'lit-translate';

import {
  cloneElement,
  Delete,
  EditorAction,
  getValue,
  identity,
  isPublic,
  newActionEvent,
  newWizardEvent,
  selector,
  Wizard,
  WizardActor,
  WizardInput,
} from '../foundation.js';
import { maxLength, patterns } from './foundation/limits.js';
import { securityEnabledEnum, smpModEnum } from './foundation/enums.js';

import { List } from '@material/mwc-list';
import { ListItem } from '@material/mwc-list/mwc-list-item';
import { SingleSelectedEvent } from '@material/mwc-list/mwc-list-foundation';

import { editDataSetWizard } from './dataset.js';
import { editSmvWizard } from './smv.js';
import { editSmvOptsWizard } from './smvopts.js';

export function openEditSampledValueControlWizardAction(
  element: Element | null | undefined
): WizardActor {
  if (!element) return () => [() => []];
  return () => [() => editSampledValueControlWizard(element!)];
}

function getSMV(element: Element): Element | null | undefined {
  const cbName = element.getAttribute('name');
  const iedName = element.closest('IED')?.getAttribute('name');
  const apName = element.closest('AccessPoint')?.getAttribute('name');
  const ldInst = element.closest('LDevice')?.getAttribute('inst');
  return element
    .closest('SCL')
    ?.querySelector(
      `:root > Communication > SubNetwork > ` +
        `ConnectedAP[iedName="${iedName}"][apName="${apName}"] > ` +
        `SMV[ldInst="${ldInst}"][cbName="${cbName}"]`
    );
}

export function renderSampledValueControlAttributes(
  name: string | null,
  desc: string | null,
  multicast: string | null,
  smvID: string | null,
  smpMod: string | null,
  smpRate: string | null,
  nofASDU: string | null,
  securityEnabled: string | null
): TemplateResult[] {
  return [
    html`<wizard-textfield
      label="name"
      .maybeValue=${name}
      helper="${translate('scl.name')}"
      required
      validationMessage="${translate('textfield.required')}"
      pattern="${patterns.asciName}"
      maxLength="${maxLength.cbName}"
      dialogInitialFocus
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="desc"
      .maybeValue=${desc}
      nullable
      helper="${translate('scl.desc')}"
    ></wizard-textfield>`,
    html`<wizard-select
      label="multicast"
      .maybeValue=${multicast}
      helper="${translate('scl.multicast')}"
      disabled
      >${['true', 'false'].map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
    html`<wizard-textfield
      label="smvID"
      .maybeValue=${smvID}
      helper="${translate('scl.id')}"
      required
      validationMessage="${translate('textfield.nonempty')}"
    ></wizard-textfield>`,
    html`<wizard-select
      label="smpMod"
      .maybeValue=${smpMod}
      nullable
      required
      helper="${translate('scl.smpMod')}"
      >${smpModEnum.map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
    html`<wizard-textfield
      label="smpRate"
      .maybeValue=${smpRate}
      helper="${translate('scl.smpRate')}"
      nullable
      required
      type="number"
      min="0"
      suffix="ms"
    ></wizard-textfield>`,
    html`<wizard-textfield
      label="nofASDU"
      .maybeValue=${nofASDU}
      helper="${translate('scl.nofASDU')}"
      nullable
      required
      type="number"
      min="0"
      suffix="ms"
    ></wizard-textfield>`,
    html`<wizard-select
      label="securityEnabled"
      .maybeValue=${securityEnabled}
      nullable
      required
      helper="${translate('scl.securityEnabled')}"
      >${securityEnabledEnum.map(
        option =>
          html`<mwc-list-item value="${option}">${option}</mwc-list-item>`
      )}</wizard-select
    >`,
  ];
}

export function removeSmvControl(element: Element): Delete[] {
  const dataSet = element.parentElement!.querySelector(
    `DataSet[name="${element.getAttribute('datSet')}"]`
  );
  const sMV = getSMV(element);

  const singleUse =
    Array.from(
      element.parentElement?.querySelectorAll<Element>(
        'ReportControl, GSEControl, SampledValueControl'
      ) ?? []
    ).filter(
      controlblock =>
        controlblock.getAttribute('datSet') === dataSet?.getAttribute('name')
    ).length <= 1;

  const actions: Delete[] = [];

  actions.push({
    old: {
      parent: element.parentElement!,
      element,
      reference: element.nextSibling,
    },
  });

  if (dataSet && singleUse)
    actions.push({
      old: {
        parent: element.parentElement!,
        element: dataSet,
        reference: element.nextSibling,
      },
    });

  if (sMV)
    actions.push({
      old: {
        parent: sMV.parentElement!,
        element: sMV,
        reference: sMV.nextSibling,
      },
    });

  return actions;
}

export function updateReportControlAction(element: Element): WizardActor {
  return (inputs: WizardInput[]): EditorAction[] => {
    const name = inputs.find(i => i.label === 'name')!.value!;
    const desc = getValue(inputs.find(i => i.label === 'desc')!);
    const buffered = getValue(inputs.find(i => i.label === 'buffered')!);
    const rptID = getValue(inputs.find(i => i.label === 'rptID')!)!;
    const indexed = getValue(inputs.find(i => i.label === 'indexed')!);
    const bufTime = getValue(inputs.find(i => i.label === 'bufTime')!);
    const intgPd = getValue(inputs.find(i => i.label === 'intgPd')!);

    let reportControlAction: EditorAction | null;
    if (
      name === element.getAttribute('name') &&
      desc === element.getAttribute('desc') &&
      buffered === element.getAttribute('buffered') &&
      rptID === element.getAttribute('rptID') &&
      indexed === element.getAttribute('indexed') &&
      bufTime === element.getAttribute('bufTime') &&
      intgPd === element.getAttribute('intgPd')
    ) {
      reportControlAction = null;
    } else {
      const newElement = cloneElement(element, {
        name,
        desc,
        buffered,
        rptID,
        indexed,
        bufTime,
        intgPd,
      });
      reportControlAction = { old: { element }, new: { element: newElement } };
    }

    const actions: EditorAction[] = [];
    if (reportControlAction) actions.push(reportControlAction);
    return actions;
  };
}

export function editSampledValueControlWizard(element: Element): Wizard {
  const name = element.getAttribute('name');
  const desc = element.getAttribute('desc');
  const multicast = element.getAttribute('multicast');
  const smvID = element.getAttribute('smvID');

  const smpMod = element.getAttribute('smpMode');

  const smpRate = element.getAttribute('bufTime');
  const nofASDU = element.getAttribute('nofASDU');

  const securityEnabled = element.getAttribute('securityEnabled');

  const dataSet = element.parentElement?.querySelector(
    `DataSet[name="${element.getAttribute('datSet')}"]`
  );
  const smvOpts = element.querySelector('SmvOpts');
  const sMV = getSMV(element);

  return [
    {
      title: get('wizard.title.edit', { tagName: element.tagName }),
      element,
      primary: {
        icon: 'save',
        label: get('save'),
        action: updateReportControlAction(element),
      },
      content: [
        html`<mwc-button
          label="${translate('remove')}"
          icon="delete"
          @click=${(e: MouseEvent) => {
            const deleteActions = removeSmvControl(element);
            deleteActions.forEach(deleteAction =>
              e.target?.dispatchEvent(newActionEvent(deleteAction))
            );
            e.target?.dispatchEvent(newWizardEvent());
          }}
        ></mwc-button>`,
        ...renderSampledValueControlAttributes(
          name,
          desc,
          multicast,
          smvID,
          smpMod,
          smpRate,
          nofASDU,
          securityEnabled
        ),
        dataSet
          ? html`<mwc-button
              id="editdataset"
              label=${translate('wizard.title.edit', {
                tagName: get('scl.DataSet'),
              })}
              icon="edit"
              @click=${(e: MouseEvent) => {
                if (dataSet) {
                  e.target?.dispatchEvent(newWizardEvent());
                  e.target?.dispatchEvent(
                    newWizardEvent(editDataSetWizard(dataSet))
                  );
                }
              }}
            ></mwc-button>`
          : html``,
        smvOpts
          ? html`<mwc-button
              id="editoptfields"
              label=${get('scl.OptFields')}
              icon="edit"
              @click=${(e: MouseEvent) => {
                if (dataSet) {
                  e.target?.dispatchEvent(newWizardEvent());
                  e.target?.dispatchEvent(
                    newWizardEvent(editSmvOptsWizard(smvOpts))
                  );
                }
              }}
            ></mwc-button>`
          : html``,
        sMV
          ? html`<mwc-button
              id="editgse"
              label=${translate('scl.Communication')}
              icon="edit"
              @click="${(e: MouseEvent) => {
                e.target?.dispatchEvent(newWizardEvent());
                e.target?.dispatchEvent(newWizardEvent(editSmvWizard(sMV)));
              }}}"
            ></mwc-button>`
          : html``,
      ],
    },
  ];
}

export function selectSampledValueControlWizard(element: Element): Wizard {
  const smvControls = Array.from(
    element.querySelectorAll('SampledValueControl')
  ).filter(isPublic);

  return [
    {
      title: get('wizard.title.select', { tagName: 'SampledValueControl' }),
      content: [
        html`<filtered-list
          @selected=${(e: SingleSelectedEvent) => {
            const smvControlIndentity = (<ListItem>(<List>e.target).selected)
              .value;
            const smvControl = element.querySelector<Element>(
              selector('SampledValueControl', smvControlIndentity)
            );
            if (smvControl) {
              e.target!.dispatchEvent(
                newWizardEvent(editSampledValueControlWizard(smvControl))
              );
              e.target!.dispatchEvent(newWizardEvent());
            }
          }}
          >${smvControls.map(
            smvControl =>
              html`<mwc-list-item twoline value="${identity(smvControl)}"
                ><span>${smvControl.getAttribute('name')}</span
                ><span slot="secondary"
                  >${identity(smvControl)}</span
                ></mwc-list-item
              >`
          )}</filtered-list
        >`,
      ],
    },
  ];
}