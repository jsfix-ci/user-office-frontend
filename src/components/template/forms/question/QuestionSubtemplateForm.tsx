import { FormControl, InputLabel, Link, MenuItem } from '@material-ui/core';
import { Field } from 'formik';
import { Select, TextField } from 'formik-material-ui';
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Question, TemplateCategoryId } from '../../../../generated/sdk';
import { useTemplateCategories } from '../../../../hooks/useTemplateCategories';
import { useTemplates } from '../../../../hooks/useTemplates';
import { useNaturalKeySchema } from '../../../../utils/userFieldValidationSchema';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionSubtemplateForm: TFormSignature<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryId>(
    TemplateCategoryId.SAMPLE_DECLARATION
  );
  const { categories } = useTemplateCategories();
  const { templates } = useTemplates(false, selectedCategory);

  return (
    <QuestionFormShell
      label="Template"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          templateId: Yup.number().required('Template is required'),
          templateCategory: Yup.number().required('Category is required'),
          addEntryButtonLabel: Yup.string(),
          maxEntries: Yup.number().nullable(),
        }),
      })}
    >
      {() => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />

          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <TitledContainer label="Options">
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="config.templateCategory">
                Template category
              </InputLabel>
              <Field
                name="config.templateCategory"
                type="text"
                component={Select}
                data-cy="templateCategory"
                inputProps={{
                  onChange: (e: any) => {
                    const categoryAsInt = e.target.value;
                    const categoryId = categories.find(
                      item => item.categoryIdAsInt === categoryAsInt
                    )!.categoryId;
                    setSelectedCategory(categoryId);
                  },
                }}
              >
                {categories.map(category => {
                  if (
                    category.categoryId ===
                    TemplateCategoryId.PROPOSAL_QUESTIONARY
                  ) {
                    return null;
                  }
                  return (
                    <MenuItem
                      value={category.categoryIdAsInt}
                      key={category.categoryIdAsInt}
                    >
                      {category.name}
                    </MenuItem>
                  );
                })}
              </Field>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="config.templateId">Template name</InputLabel>
              <Field
                name="config.templateId"
                type="text"
                component={Select}
                data-cy="templateId"
              >
                {templates.map(template => {
                  return (
                    <MenuItem
                      value={template.templateId}
                      key={template.templateId}
                    >
                      {template.name}
                    </MenuItem>
                  );
                })}
              </Field>
              <Link href="/SampleDeclarationTemplates/" target="blank">
                View all templates
              </Link>
            </FormControl>

            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="addEntryButtonLabel"
            />
            <Field
              name="config.maxEntries"
              label="Max entries"
              placeholder="(e.g. 4, leave blank for unlimited)"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="maxEntries"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
