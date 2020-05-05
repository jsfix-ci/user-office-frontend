import { useState } from 'react';

import {
  FieldDependency,
  ProposalTemplate,
  QuestionRel,
  DataType,
} from '../generated/sdk';
import { getFieldById } from '../models/ProposalModelFunctions';
import { Event, EventType } from '../models/QuestionaryEditorModel';
import { useDataApi } from './useDataApi';

export function usePersistModel() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const api = useDataApi();

  const updateFieldTopicRel = async (topicId: number, fieldIds: string[]) => {
    return api()
      .updateQuestionsTopicRels({
        templateId: 1,
        topicId,
        fieldIds,
      })
      .then(data => data.updateQuestionsTopicRels);
  };

  const updateTopic = async (
    topicId: number,
    values: { title?: string; isEnabled?: boolean }
  ) => {
    return api()
      .updateTopic({
        ...values,
        topicId,
      })
      .then(data => {
        return data.updateTopic;
      });
  };

  const updateTopicOrder = async (topicOrder: number[]) => {
    return api()
      .updateTopicOrder({
        topicOrder,
      })
      .then(data => data.updateTopicOrder);
  };

  // Have this until GQL accepts Union types
  // https://github.com/graphql/graphql-spec/blob/master/rfcs/InputUnion.md
  const prepareDependencies = (dependency: FieldDependency) => {
    return {
      ...dependency,
      condition: {
        ...dependency.condition,
        params: JSON.stringify({ value: dependency.condition.params }),
      },
    };
  };

  const updateItem = async (field: QuestionRel) => {
    return api()
      .updateQuestion({
        id: field.question.proposalQuestionId,
        naturalKey: field.question.naturalKey,
        question: field.question.question,
        config: field.question.config
          ? JSON.stringify(field.question.config)
          : undefined,
      })
      .then(data => {
        return api()
          .updateQuestionRel({
            templateId: 1,
            topicId: 1,
            sortOrder: 0,
            questionId: field.question.proposalQuestionId,
            dependency: field.dependency
              ? prepareDependencies(field.dependency)
              : undefined,
          })
          .then(data => {
            return data.updateQuestionRel;
          });
      });
  };

  const createQuestion = async (dataType: DataType) => {
    setIsLoading(true);

    return api()
      .createQuestion({
        dataType: dataType,
      })
      .then(questionResponse => {
        setIsLoading(false);

        return questionResponse.createQuestion;
      });
  };

  const deleteQuestionRel = async (id: string) => {
    setIsLoading(true);

    return api()
      .deleteQuestionRel({
        templateId: 1,
        questionId: id,
      })
      .then(data => {
        setIsLoading(false);

        return data.deleteQuestionRel;
      });
  };

  const deleteTopic = async (topicId: number) => {
    return api()
      .deleteTopic({
        topicId,
      })
      .then(data => data.deleteTopic);
  };

  const createTopic = async (sortOrder: number) => {
    return api()
      .createTopic({ templateId: 1, sortOrder })
      .then(data => {
        return data.createTopic;
      });
  };

  const createQuestionRel = async (
    templateId: number,
    topicId: number,
    questionId: string,
    sortOrder: number
  ) => {
    return api()
      .createQuestionRel({ templateId, topicId, questionId, sortOrder })
      .then(data => {
        return data.createQuestionRel;
      });
  };

  type MonitorableServiceCall = () => Promise<{
    error?: string | null;
  }>;

  const persistModel = ({
    getState,
    dispatch,
  }: {
    getState: () => ProposalTemplate;
    dispatch: React.Dispatch<Event>;
  }) => {
    const executeAndMonitorCall = (call: MonitorableServiceCall) => {
      setIsLoading(true);
      call().then(result => {
        if (result.error) {
          dispatch({
            type: EventType.SERVICE_ERROR_OCCURRED,
            payload: result.error,
          });
        }
        setIsLoading(false);
      });
    };

    return (next: Function) => (action: Event) => {
      next(action);
      const state = getState();

      switch (action.type) {
        case EventType.REORDER_FIELD_REQUESTED:
          const reducedTopicId = parseInt(action.payload.source.droppableId);
          const extendedTopicId = parseInt(
            action.payload.destination.droppableId
          );
          const reducedTopic = state.steps.find(
            step => step.topic.id === reducedTopicId
          );
          const extendedTopic = state.steps.find(
            step => step.topic.id === extendedTopicId
          );

          executeAndMonitorCall(() =>
            updateFieldTopicRel(
              reducedTopic!.topic.id,
              reducedTopic!.fields.map(
                field => field.question.proposalQuestionId
              )
            )
          );
          if (reducedTopicId !== extendedTopicId) {
            executeAndMonitorCall(() =>
              updateFieldTopicRel(
                extendedTopic!.topic.id,
                extendedTopic!.fields.map(
                  field => field.question.proposalQuestionId
                )
              )
            );
          }
          break;
        case EventType.REORDER_TOPIC_REQUESTED:
          const topicOrder = state.steps.map(step => step.topic.id);
          executeAndMonitorCall(() => updateTopicOrder(topicOrder));
          break;
        case EventType.UPDATE_TOPIC_TITLE_REQUESTED:
          executeAndMonitorCall(() =>
            updateTopic(action.payload.topicId, {
              title: action.payload.title as string,
            })
          );
          break;
        case EventType.UPDATE_FIELD_REQUESTED:
          executeAndMonitorCall(async () => {
            const field = action.payload.field as QuestionRel;
            const result = await updateItem(field);
            dispatch({
              type: EventType.FIELD_UPDATED,
              payload: result.template,
            });

            return result;
          });
          break;
        case EventType.CREATE_NEW_QUESTION_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createQuestion(action.payload.dataType);
            dispatch({
              type: EventType.QUESTION_CREATED,
              payload: result.question,
            });

            return result;
          });
          break;
        case EventType.DELETE_QUESTION_REL_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await deleteQuestionRel(action.payload.fieldId);
            if (result.template) {
              dispatch({
                type: EventType.QUESTION_REL_DELETED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        case EventType.DELETE_TOPIC_REQUESTED:
          executeAndMonitorCall(() => deleteTopic(action.payload));
          break;
        case EventType.CREATE_TOPIC_REQUESTED:
          executeAndMonitorCall(async () => {
            const result = await createTopic(action.payload.sortOrder);
            if (result.template) {
              dispatch({
                type: EventType.TOPIC_CREATED,
                payload: result.template,
              });
            }

            return result;
          });
          break;
        case EventType.CREATE_QUESTION_REL_REQUESTED:
          const { questionId, topicId, sortOrder } = action.payload;

          executeAndMonitorCall(async () => {
            const templateId = getState().templateId;
            const result = await createQuestionRel(
              templateId,
              topicId,
              questionId,
              sortOrder
            );
            if (result.template) {
              dispatch({
                type: EventType.QUESTION_REL_CREATED,
                payload: result.template,
              });
            }

            return result;
          });

          break;
        default:
          break;
      }
    };
  };

  return { isLoading, persistModel };
}
