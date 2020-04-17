import {
  makeStyles,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogContent,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Formik, Form } from 'formik';
import MaterialTable from 'material-table';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Sep } from '../../generated/sdk';
import { useDataApi } from '../../hooks/useDataApi';
import { ButtonContainer } from '../../styles/StyledComponents';
import { tableIcons } from '../../utils/materialIcons';
import FormikDropdown from '../common/FormikDropdown';
import SEPValidationSchema from './SEPValidationSchema';

type SEPMembersProps = {
  /** SEP data to be shown */
  data: Sep;
};

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPMembers: React.FC<SEPMembersProps> = ({ data }) => {
  const [show, setShow] = useState(false);
  const sep = { ...data };
  const classes = useStyles();
  const api = useDataApi();
  const { enqueueSnackbar } = useSnackbar();

  const columns = [
    { title: 'First name', field: 'firstName' },
    {
      title: 'Last name',
      field: 'lastName',
    },
    {
      title: 'Email',
      field: 'email',
    },
  ];

  if (!sep) {
    return <p>Loading...</p>;
  }

  const AddIcon = (): JSX.Element => <Add data-cy="add-member" />;

  return (
    <React.Fragment>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={show}
        onClose={(): void => setShow(false)}
      >
        <DialogContent>
          <p>Add member</p>
        </DialogContent>
      </Dialog>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={sep}
        onSubmit={(values, actions): void => {
          // sendSEPUpdate(values);
          actions.setSubmitting(false);
        }}
        validationSchema={SEPValidationSchema}
      >
        {({
          isSubmitting,
          values,
          errors,
          touched,
          handleChange,
          setFieldValue,
        }): JSX.Element => (
          <Form>
            <Typography variant="h6" gutterBottom>
              SEP Members
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <FormikDropdown
                  name="SEPChair"
                  label="SEP Chair"
                  items={[]}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <FormikDropdown
                  name="SEPSecretary"
                  label="SEP Secretary"
                  items={[]}
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={3}>
              <div data-cy="sep-reviewers-table" style={{ width: '100%' }}>
                <MaterialTable
                  icons={tableIcons}
                  title={'Reviewers'}
                  columns={columns}
                  data={[]}
                  options={{
                    search: false,
                  }}
                  actions={[
                    {
                      icon: AddIcon,
                      isFreeAction: true,
                      tooltip: 'Add Member',
                      onClick: (): void => setShow(true),
                    },
                  ]}
                />
              </div>
            </Grid>
            <ButtonContainer>
              <Button
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Save SEP Members
              </Button>
            </ButtonContainer>
          </Form>
        )}
      </Formik>
    </React.Fragment>
  );
};

SEPMembers.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.number.isRequired,
    code: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    numberRatingsRequired: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
  }).isRequired,
};

export default SEPMembers;
