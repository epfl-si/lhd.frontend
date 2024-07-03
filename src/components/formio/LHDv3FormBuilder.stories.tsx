import React from "react";
import { useState } from "react";
import type { Meta, StoryObj } from '@storybook/react';
import {LHDv3FormBuilder, LHDv3FormType} from './LHDv3Forms';
import { Form } from "@formio/react";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta : Meta<typeof LHDv3FormBuilder> = {
  title: 'FormIO/LHDv3FormBuilder',
  component: LHDv3FormBuilder,
  parameters: {
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
}

export default meta;

type Story = StoryObj<typeof LHDv3FormBuilder>;
export const Simple: Story = {
  args: {

  }
};

const multiplier = 3000;

function multipliered(pattern: (n: number) => string) : string[] {
  return Array.from({ length: multiplier }, (v, i) => pattern(i + 1));
}

const organisms = multipliered((n) => `Organism ${n}`),
  rooms = multipliered((n) => `Room ${n}`);

export const LargeList: Story = {
  render() {
    const initialForm: LHDv3FormType = {"components":
        [
          {"label":"Organism","labelPosition":"top","widget":"choicesjs","placeholder":"","description":"","tooltip":"","customClass":"","tabindex":"","hidden":false,"hideLabel":false,"uniqueOptions":false,"autofocus":false,"disabled":false,"tableView":true,"modalEdit":false,"multiple":false,"dataSrc":"json","defaultValue":"","data":{"values":[{"label":"","value":""}],"resource":"","url":"","json":organisms,"custom":""},"dataType":"","idPath":"id","valueProperty":"","template":"<span>{{ item }}</span>","refreshOn":"","refreshOnBlur":"","clearOnRefresh":false,"searchEnabled":true,"selectThreshold":0.3,"readOnlyValue":false,"customOptions":{},"useExactSearch":false,"persistent":true,"protected":false,"dbIndex":false,"encrypted":false,"clearOnHide":true,"customDefaultValue":"","calculateValue":"","calculateServer":false,"allowCalculateOverride":false,"validateOn":"change","validate":{"required":false,"onlyAvailableItems":false,"customMessage":"","custom":"","customPrivate":false,"json":"","strictDateValidation":false,"multiple":false,"unique":false},"unique":false,"errorLabel":"","errors":"","key":"organism","tags":[],"properties":{},"conditional":{"show":null,"when":null,"eq":"","json":""},"customConditional":"","logic":[],"attributes":{},"overlay":{"style":"","page":"","left":"","top":"","width":"","height":""},"type":"lhdselect","indexeddb":{"filter":{}},"selectFields":"","searchField":"","searchDebounce":0.3,"minSearch":0,"filter":"","limit":100,"redrawOn":"","input":true,"prefix":"","suffix":"","dataGridLabel":false,"showCharCount":false,"showWordCount":false,"allowMultipleMasks":false,"addons":[],"authenticate":false,"ignoreCache":false,"lazyLoad":true,"fuseOptions":{"include":"score","threshold":0.3},"id":"eyj9k6g"},
          {"label":"Other impacted rooms","labelPosition":"top","widget":"choicesjs","placeholder":"","description":"","tooltip":"","customClass":"","tabindex":"","hidden":false,"hideLabel":false,"uniqueOptions":false,"autofocus":false,"disabled":false,"tableView":true,"modalEdit":false,"multiple":false,"dataSrc":"json","defaultValue":"","data":{"resource":"","url":"","json":rooms,"custom":"","values":[{"label":"","value":""}]},"dataType":"","idPath":"id","valueProperty":"","template":"<span>{{ item }}</span>","refreshOn":"input","clearOnRefresh":true,"searchEnabled":true,"selectThreshold":0.3,"readOnlyValue":false,"customOptions":{},"useExactSearch":false,"persistent":true,"protected":false,"dbIndex":false,"encrypted":false,"clearOnHide":true,"customDefaultValue":"","calculateValue":"","calculateServer":false,"allowCalculateOverride":false,"validateOn":"change","validate":{"required":false,"onlyAvailableItems":false,"customMessage":"","custom":"","customPrivate":false,"json":"","strictDateValidation":false,"multiple":true,"unique":false},"unique":false,"errorLabel":"","errors":"","key":"rooms","tags":[],"properties":{},"conditional":{"show":null,"when":null,"eq":"","json":""},"customConditional":"","logic":[],"attributes":{},"overlay":{"style":"","page":"","left":"","top":"","width":"","height":""},"type":"lhdmultiselect","indexeddb":{"filter":{}},"selectFields":"","searchField":"","searchDebounce":0.3,"minSearch":0,"filter":"","limit":100,"redrawOn":"","input":true,"lazyLoad":true,"prefix":"","suffix":"","dataGridLabel":false,"showCharCount":false,"showWordCount":false,"allowMultipleMasks":false,"addons":[],"authenticate":false,"ignoreCache":false,"fuseOptions":{"include":"score","threshold":0.3},"id":"e1eeue"},
          {"label":"Text Area","labelPosition":"top","placeholder":"","description":"","tooltip":"","prefix":"","suffix":"","widget":{"type":"input"},"displayMask":"","applyMaskOn":"change","editor":"","autoExpand":false,"customClass":"","tabindex":"","autocomplete":"","hidden":false,"hideLabel":false,"showWordCount":false,"showCharCount":false,"autofocus":false,"spellcheck":true,"disabled":false,"tableView":true,"modalEdit":false,"multiple":false,"defaultValue":"","persistent":true,"inputFormat":"html","protected":false,"dbIndex":false,"case":"","truncateMultipleSpaces":false,"encrypted":false,"redrawOn":"","clearOnHide":true,"customDefaultValue":"","calculateValue":"","calculateServer":false,"allowCalculateOverride":false,"validateOn":"change","validate":{"required":false,"pattern":"","customMessage":"","custom":"","customPrivate":false,"json":"","minLength":"","maxLength":"","minWords":"","maxWords":"","strictDateValidation":false,"multiple":false,"unique":false},"unique":false,"errorLabel":"","errors":"","key":"textArea","tags":[],"properties":{},"conditional":{"show":null,"when":null,"eq":"","json":""},"customConditional":"","logic":[],"attributes":{},"overlay":{"style":"","page":"","left":"","top":"","width":"","height":""},"type":"textarea","rows":3,"wysiwyg":false,"input":true,"refreshOn":"","dataGridLabel":false,"allowMultipleMasks":false,"addons":[],"mask":false,"inputType":"text","inputMask":"","fixedSize":true,"id":"eif44dc"}
        ]
    };
    const [ lastForm, setLastForm ] = useState(initialForm);
    const [ formShown, setFormShown ] = useState<boolean>(false);

    const submission = { data: {
        organism: "Organism 737",
        rooms: "Room 311",
        textArea: "Area 51"
      } };

    return <div>
      <LHDv3FormBuilder
        onChange={(form: LHDv3FormType) => { console.log(JSON.stringify(form)) ;  }}
        form={lastForm}
      />
      <div style={{height: "30pt"}}></div>
      <button onClick={() => setFormShown(true)}>Make a form!</button>
      <div style={{height: "30pt"}}></div>
      { formShown ? <Form form={lastForm}
                          submission={submission}/> : <></> }
    </div>;

  }
}
