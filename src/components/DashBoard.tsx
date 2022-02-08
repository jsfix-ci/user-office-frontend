import BottomNavigation from '@material-ui/core/BottomNavigation';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import parse from 'html-react-parser';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';

import { FeatureContext } from 'context/FeatureContextProvider';
import { UserContext } from 'context/UserContextProvider';
import { FeatureId, PageName, UserRole } from 'generated/sdk';
import { useGetPageContent } from 'hooks/admin/useGetPageContent';
import { useCallsData } from 'hooks/call/useCallsData';

import AppToolbar from './AppToolbar/AppToolbar';
import CallPage from './call/CallPage';
import Can, { useCheckAccess } from './common/Can';
import CreateFeedbackPage from './feedback/CreateFeedbackPage';
import UpdateFeedbackPage from './feedback/UpdateFeedbackPage';
import InstitutionPage from './institution/InstitutionPage';
import MergeInstitutionsPage from './institution/MergeInstitutionPage';
import InstrumentsPage from './instrument/InstrumentsPage';
import MenuItems from './menu/MenuItems';
import Page from './Page';
import HelpPage from './pages/HelpPage';
import InformationModal from './pages/InformationModal';
import OverviewPage from './pages/OverviewPage';
import PageEditor from './pages/PageEditor';
import ProposalChooseCall from './proposal/ProposalChooseCall';
import ProposalCreate from './proposal/ProposalCreate';
import ProposalEdit from './proposal/ProposalEdit';
import ProposalPage from './proposal/ProposalPage';
import InstrSciUpcomingExperimentTimesTable from './proposalBooking/InstrSciUpcomingExperimentTimesTable';
import UserExperimentTimesTable from './proposalBooking/UserExperimentsTable';
import CreateProposalEsiPage from './proposalEsi/CreateProposalEsiPage';
import UpdateProposalEsiPage from './proposalEsi/UpdateProposalEsiPage';
import ProposalTableReviewer from './review/ProposalTableReviewer';
import SampleSafetyPage from './sample/SampleSafetyPage';
import SEPPage from './SEP/SEPPage';
import SEPsPage from './SEP/SEPsPage';
import ApiAccessTokensPage from './settings/apiAccessTokens/ApiAccessTokensPage';
import ProposalStatusesPage from './settings/proposalStatus/ProposalStatusesPage';
import ProposalWorkflowEditor from './settings/proposalWorkflow/ProposalWorkflowEditor';
import ProposalWorkflowsPage from './settings/proposalWorkflow/ProposalWorkflowsPage';
import UnitTablePage from './settings/unitList/UnitTablePage';
import DeclareShipmentsPage from './shipments/DeclareShipmentsPage';
import ProposalEsiPage from './template/EsiPage';
import FeedbackTemplatesPage from './template/FeedbackTemplatesPage';
import GenericTemplatesPage from './template/GenericTemplatesPage';
import ImportTemplatePage from './template/import/ImportTemplatePage';
import ProposalTemplatesPage from './template/ProposalTemplatesPage';
import QuestionsPage from './template/QuestionsPage';
import SampleEsiPage from './template/SampleEsiPage';
import SampleTemplatesPage from './template/SampleTemplatesPage';
import ShipmentTemplatesPage from './template/ShipmentTemplatesPage';
import TemplateEditor from './template/TemplateEditor';
import VisitTemplatesPage from './template/VisitTemplatesPage';
import PeoplePage from './user/PeoplePage';
import ProfilePage from './user/ProfilePage';
import UserPage from './user/UserPage';

type BottomNavItemProps = {
  /** Content of the information modal. */
  text?: string;
  /** Text of the button link in the information modal. */
  linkText?: string;
};

const BottomNavItem: React.FC<BottomNavItemProps> = ({ text, linkText }) => {
  return (
    <InformationModal
      text={text}
      linkText={linkText}
      linkStyle={{
        fontSize: '12px',
        minWidth: 'auto',
        padding: '10px',
      }}
    />
  );
};

BottomNavItem.propTypes = {
  text: PropTypes.string,
  linkText: PropTypes.string,
};

const drawerWidth = 250;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    ...theme.mixins.toolbar,

    '& .closeDrawer': {
      marginLeft: 'auto',
    },
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  content: {
    flexGrow: 1,
    height: 'calc(100vh - 64px)',
    marginTop: '64px',
    width: `calc(100% - ${drawerWidth}px)`,
  },
  bottomNavigation: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: theme.spacing(2),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
  },
}));

const Dashboard: React.FC = () => {
  const [header, setHeader] = useState('User Office');
  const isTabletOrMobile = useMediaQuery('(max-width: 1224px)');
  const classes = useStyles();
  const [open, setOpen] = React.useState(
    localStorage.drawerOpen
      ? localStorage.drawerOpen === '1'
      : !isTabletOrMobile
  );
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);
  const isSampleSafetyReviewer = useCheckAccess([
    UserRole.SAMPLE_SAFETY_REVIEWER,
  ]);

  const featureContext = useContext(FeatureContext);
  const isSchedulerEnabled = featureContext.features.get(
    FeatureId.SCHEDULER
  )?.isEnabled;

  const { currentRole } = useContext(UserContext);
  const { calls } = useCallsData({ isActive: true });

  useEffect(() => {
    if (isTabletOrMobile) {
      setOpen(false);
    } else if (localStorage.getItem('drawerOpen') === '1') {
      setOpen(true);
    }
  }, [isTabletOrMobile]);

  const handleDrawerOpen = () => {
    localStorage.setItem('drawerOpen', '1');
    setOpen(true);
  };
  const handleDrawerClose = () => {
    localStorage.setItem('drawerOpen', '0');
    setOpen(false);
  };

  const [, privacyPageContent] = useGetPageContent(PageName.PRIVACYPAGE);
  const [, faqPageContent] = useGetPageContent(PageName.HELPPAGE);
  const [, footerContent] = useGetPageContent(PageName.FOOTERCONTENT);

  // TODO: Check who can see what and modify the access control here.
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppToolbar
        open={open}
        handleDrawerOpen={handleDrawerOpen}
        header={header}
      />
      <Drawer
        variant={isTabletOrMobile ? 'temporary' : 'permanent'}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        open={open}
        onClose={handleDrawerClose}
      >
        <div className={classes.toolbarIcon}>
          {isTabletOrMobile && (
            <Typography component="h1" variant="h6" color="inherit" noWrap>
              {header}
            </Typography>
          )}
          <IconButton
            aria-label="Close drawer"
            onClick={handleDrawerClose}
            className="closeDrawer"
          >
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List disablePadding>
          <MenuItems callsData={calls} currentRole={currentRole} />
        </List>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <Switch>
          <Page
            setHeader={setHeader}
            title="Edit Proposal"
            path="/ProposalEdit/:proposalPk"
            component={ProposalEdit}
          />
          <Page
            setHeader={setHeader}
            title="Select Proposal Type"
            path="/ProposalSelectType"
            component={() => <ProposalChooseCall callsData={calls} />}
          />
          <Page
            setHeader={setHeader}
            title="Create Proposal"
            path="/ProposalCreate/:callId/:templateId"
            component={ProposalCreate}
          />
          <Page
            setHeader={setHeader}
            title="Profile Page"
            path="/ProfilePage/:id"
            component={ProfilePage}
          />
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="User Page"
              path="/PeoplePage/:id"
              component={UserPage}
            />
          )}
          {isUserOfficer && <Route path="/PeoplePage" component={PeoplePage} />}
          <Page
            setHeader={setHeader}
            title="Proposal"
            path="/ProposalPage"
            component={ProposalPage}
          />
          <Page
            setHeader={setHeader}
            title="Page Editor"
            path="/PageEditor"
            component={PageEditor}
          />
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Call Page"
              path="/CallPage"
              component={CallPage}
            />
          )}
          <Page
            setHeader={setHeader}
            title="Help Page"
            path="/HelpPage"
            component={HelpPage}
          />
          <Page
            setHeader={setHeader}
            title="SEP Page"
            path="/SEPPage/:id"
            component={SEPPage}
          />
          <Page
            setHeader={setHeader}
            title="SEPs Page"
            path="/SEPPage"
            component={SEPsPage}
          />
          <Page
            setHeader={setHeader}
            title="Instruments"
            path="/InstrumentPage"
            component={InstrumentsPage}
          />
          <Page
            setHeader={setHeader}
            title="Institution"
            path="/InstitutionPage"
            component={InstitutionPage}
          />
          <Page
            setHeader={setHeader}
            title="Merge Institution"
            path="/MergeInstitutionsPage/:institutionId"
            component={MergeInstitutionsPage}
          />
          <Page
            setHeader={setHeader}
            title="Template Editor"
            path="/QuestionaryEditor/:templateId"
            component={TemplateEditor}
          />
          <Page
            setHeader={setHeader}
            title="Proposal Templates"
            path="/ProposalTemplates"
            component={ProposalTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Samples Templates"
            path="/SampleDeclarationTemplates"
            component={SampleTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Generic Template"
            path="/GenericTemplates"
            component={GenericTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Shipment Templates"
            path="/ShipmentDeclarationTemplates"
            component={ShipmentTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Visits Template"
            path="/VisitTemplates"
            component={VisitTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Feedback Template"
            path="/FeedbackTemplates"
            component={FeedbackTemplatesPage}
          />
          <Page
            setHeader={setHeader}
            title="Esi Proposal Page"
            path="/EsiTemplates"
            component={ProposalEsiPage}
          />
          <Page
            setHeader={setHeader}
            title="Esi Samples"
            path="/SampleEsiTemplates"
            component={SampleEsiPage}
          />
          <Page
            setHeader={setHeader}
            title="Proposal Table Reviewer"
            path="/ProposalTableReviewer"
            component={ProposalTableReviewer}
          />
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Units Table"
              path="/Units"
              component={UnitTablePage}
            />
          )}
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Proposal Status"
              path="/ProposalStatuses"
              component={ProposalStatusesPage}
            />
          )}
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Proposal Workflows"
              path="/ProposalWorkflows"
              component={ProposalWorkflowsPage}
            />
          )}
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Proposal Worjflow Editor"
              path="/ProposalWorkflowEditor/:workflowId"
              component={ProposalWorkflowEditor}
            />
          )}
          {(isSampleSafetyReviewer || isUserOfficer) && (
            <Page
              setHeader={setHeader}
              title="Samples Safety"
              path="/SampleSafety"
              component={SampleSafetyPage}
            />
          )}

          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Api Access Tokens"
              path="/ApiAccessTokens"
              component={ApiAccessTokensPage}
            />
          )}
          {isSchedulerEnabled && (
            <Page
              setHeader={setHeader}
              title="User Experiment TimeTable"
              path="/ExperimentTimes"
              component={UserExperimentTimesTable}
            />
          )}
          {isSchedulerEnabled && (
            <Page
              setHeader={setHeader}
              title="InstrSci Upcoming Experiment TimeTable"
              path="/UpcomingExperimentTimes"
              component={InstrSciUpcomingExperimentTimesTable}
            />
          )}
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Questions"
              path="/Questions"
              component={QuestionsPage}
            />
          )}
          {isUserOfficer && (
            <Page
              setHeader={setHeader}
              title="Import Templates"
              path="/ImportTemplate"
              component={ImportTemplatePage}
            />
          )}
          <Page
            setHeader={setHeader}
            title="Create Esi Proposal"
            path="/CreateEsi/:scheduledEventId"
            component={CreateProposalEsiPage}
          />
          <Page
            setHeader={setHeader}
            title="Update Esi Proposal"
            path="/UpdateEsi/:esiId"
            component={UpdateProposalEsiPage}
          />
          <Page
            setHeader={setHeader}
            title="Create Feedback"
            path="/CreateFeedback/:scheduledEventId"
            component={CreateFeedbackPage}
          />
          <Page
            setHeader={setHeader}
            title="Update Feedback"
            path="/UpdateFeedback/:feedbackId"
            component={UpdateFeedbackPage}
          />
          <Page
            setHeader={setHeader}
            title="Declare Shipments"
            path="/DeclareShipments/:scheduledEventId"
            component={DeclareShipmentsPage}
          />
          <Can
            allowedRoles={[UserRole.USER_OFFICER]}
            yes={() => <Route component={ProposalPage} />}
            no={() => (
              <Can
                allowedRoles={[UserRole.USER]}
                yes={() => (
                  <Route
                    render={(props) => (
                      <OverviewPage {...props} userRole={UserRole.USER} />
                    )}
                  />
                )}
                no={() => (
                  <Can
                    allowedRoles={[
                      UserRole.SEP_REVIEWER,
                      UserRole.SEP_CHAIR,
                      UserRole.SEP_SECRETARY,
                      UserRole.INSTRUMENT_SCIENTIST,
                    ]}
                    yes={() => (
                      <Route
                        render={(props) => (
                          <OverviewPage
                            {...props}
                            userRole={currentRole as UserRole}
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
            )}
          />
        </Switch>
        {parse(footerContent)}
        <BottomNavigation className={classes.bottomNavigation}>
          <BottomNavItem
            text={privacyPageContent}
            linkText={'Privacy Statement'}
          />
          <BottomNavItem text={faqPageContent} linkText={'FAQ'} />
          <BottomNavItem />
        </BottomNavigation>
      </main>
    </div>
  );
};

export default Dashboard;
