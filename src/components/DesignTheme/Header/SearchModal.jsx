import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Container,
  Row,
  Col,
  Button,
  ButtonToolbar,
  Icon,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  FormGroup,
  Input,
  Label,
  Toggle,
} from 'design-react-kit/dist/design-react-kit';
import { defineMessages, injectIntl } from 'react-intl';
import mapValues from 'lodash/mapValues';
import toPairs from 'lodash/toPairs';
import fromPairs from 'lodash/fromPairs';
import cx from 'classnames';
import moment from 'moment';

import Checkbox from '../../Checkbox';

const messages = defineMessages({
  closeSearch: {
    id: 'closeSearch',
    defaultMessage: 'Chiudi cerca',
  },
  backToSearch: {
    id: 'backToSearch',
    defaultMessage: 'Torna alla ricerca',
  },
  search: {
    id: 'search',
    defaultMessage: 'Cerca',
  },
  searchLabel: {
    id: 'searchLabel',
    defaultMessage: 'Cerca nel sito',
  },
  filters: {
    id: 'filters',
    defaultMessage: 'Filtri',
  },
  confirmSearch: {
    id: 'confirmSearch',
    defaultMessage: 'Conferma',
  },
  sections: {
    id: 'sections',
    defaultMessage: 'Sezioni',
  },
  topics: {
    id: 'topics',
    defaultMessage: 'Argomenti',
  },
  options: {
    id: 'options',
    defaultMessage: 'Opzioni',
  },
  allFilters: {
    id: 'allFilters',
    defaultMessage: 'Tutto',
  },
  amministrazione: {
    id: 'amministrazione',
    defaultMessage: 'Amministrazione',
  },
  servizi: {
    id: 'servizi',
    defaultMessage: 'Servizi',
  },
  novita: {
    id: 'novita',
    defaultMessage: 'Novità',
  },
  documenti: {
    id: 'documenti',
    defaultMessage: 'Documenti e dati',
  },
  allTopics: {
    id: 'allTopics',
    defaultMessage: 'Tutti gli argomenti',
  },
  allOptions: {
    id: 'allOptions',
    defaultMessage: 'Tutte le date',
  },
  removeTopic: {
    id: 'removeTopic',
    defaultMessage: 'Rimuovi argomento',
  },
  removeOption: {
    id: 'removeOption',
    defaultMessage: 'Rimuovi opzione',
  },
  optionActiveContentButton: {
    id: 'optionActiveContentButton',
    defaultMessage: 'Contenuto attivo',
  },
  optionActiveContentLabel: {
    id: 'optionActiveContentLabel',
    defaultMessage: 'Cerca solo tra i contenuti attivi',
  },
  optionActiveContentInfo: {
    id: 'optionActiveContentInfo',
    defaultMessage:
      'Verranno esclusi dalla ricerca i contenuti archiviati e non più validi come gli eventi terminati o i bandi scaduti.',
  },
  optionDateStart: {
    id: 'optionDateStart',
    defaultMessage: 'Data inizio',
  },
  optionDateEnd: {
    id: 'optionDateEnd',
    defaultMessage: 'Data fine',
  },
  optionDateStartButton: {
    id: 'optionDateStartButton',
    defaultMessage: 'Dal',
  },
  optionDateEndButton: {
    id: 'optionDateEndButton',
    defaultMessage: 'Al',
  },
  optionDatePlaceholder: {
    id: 'optionDatePlaceholder',
    defaultMessage: 'inserisci la data in formato gg/mm/aaaa',
  },
});

// A group is checked if at least one filter is checked
export const isGroupChecked = group =>
  Object.keys(group).reduce(
    (checked, filterId) => checked || group[filterId].value,
    false,
  );

// A group is indeterminate if at least one of its filters is checked, but not all of them
export const isGroupIndeterminate = (group, groupIsChecked) =>
  groupIsChecked &&
  Object.keys(group).reduce(
    (indet, filterId) => indet || !group[filterId].value,
    false,
  );

// Given a filters group, set all filters to the given state
export const updateGroupCheckedStatus = (group, checked) =>
  mapValues(group, filter => ({
    ...filter,
    value: checked,
  }));

const defaultOptions = {
  activeContent: false,
  dateStart: null,
  dateEnd: null,
};

const SearchModal = ({ closeModal, show, intl }) => {
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [advancedTab, setAdvancedTab] = useState('sections');
  const [searchText, setSearchText] = useState('');
  const [sections, setSections] = useState({
    amministrazione: {},
    servizi: {},
    novita: {},
    documenti: {},
  });
  const [topics, setTopics] = useState({});
  const [options, setOptions] = useState({ ...defaultOptions });
  const selectedTopics = fromPairs(toPairs(topics).filter(t => t[1].value));
  const checkedGroups = {
    amministrazione: isGroupChecked(sections.amministrazione),
    servizi: isGroupChecked(sections.servizi),
    novita: isGroupChecked(sections.novita),
    documenti: isGroupChecked(sections.documenti),
  };
  // The "all" filter is checked if all groups are unchecked
  const allSectionsChecked = Object.keys(checkedGroups).reduce(
    (checked, groupId) => checked && !checkedGroups[groupId],
    true,
  );
  const allTopicsChecked = Object.keys(selectedTopics).length === 0;
  const allOptionsSet =
    !options.activeContent && !options.dateStart && !options.dateEnd;

  const resetSections = () => {
    setSections(prevSections =>
      mapValues(prevSections, group => updateGroupCheckedStatus(group, false)),
    );
  };

  const setGroupChecked = (groupId, checked) => {
    setSections(prevSections => ({
      ...prevSections,
      [groupId]: updateGroupCheckedStatus(prevSections[groupId], checked),
    }));
  };

  const setSectionFilterChecked = (groupId, filterId, checked) => {
    setSections(prevSections => ({
      ...prevSections,
      [groupId]: {
        ...prevSections[groupId],
        [filterId]: {
          ...prevSections[groupId][filterId],
          value: checked,
        },
      },
    }));
  };

  const resetTopics = () => {
    setTopics(prevTopics =>
      mapValues(prevTopics, topic => ({
        ...topic,
        value: false,
      })),
    );
  };

  const setTopicChecked = (topicId, checked) => {
    setTopics(prevTopics => ({
      ...prevTopics,
      [topicId]: {
        ...prevTopics[topicId],
        value: checked,
      },
    }));
  };

  const resetOptions = () => setOptions({ ...defaultOptions });

  const setOptionValue = (optId, value) =>
    setOptions(prevOptions => ({ ...prevOptions, [optId]: value }));

  useEffect(() => {
    // TODO Fetch real data here
    setSections({
      amministrazione: {
        'organi-politici': {
          value: false,
          label: 'Organi politici',
        },
        'aree-amministrative': {
          value: false,
          label: 'Aree amministrative',
        },
      },
      servizi: {
        'anagrafe-e-stato-civile': {
          value: false,
          label: 'Anagrafe e stato civile',
        },
        turismo: {
          value: false,
          label: 'Turismo',
        },
      },
      novita: {
        avvisi: {
          value: false,
          label: 'Avvisi',
        },
        notizie: {
          value: false,
          label: 'Notizie',
        },
      },
      documenti: {
        modulistica: {
          value: false,
          label: 'Modulistica',
        },
        normative: {
          value: false,
          label: 'Normative',
        },
      },
    });
    setTopics({
      abitazione: {
        label: 'Abitazione',
        value: false,
      },
      acqua: {
        label: 'Acqua',
        value: false,
      },
    });
  }, []);

  return (
    <Modal id="search-modal" isOpen={show} toggle={closeModal}>
      <ModalHeader toggle={closeModal}>
        <Container>
          <div className="d-flex align-items-center">
            {!advancedSearch && (
              <Button
                color="link"
                title={intl.formatMessage(messages.closeSearch)}
                onClick={closeModal}
              >
                <Icon color="" icon="it-arrow-left-circle" padding={false} />
              </Button>
            )}
            {advancedSearch && (
              <Button
                color="link"
                title={intl.formatMessage(messages.backToSearch)}
                className="back-to-search text-reset"
                onClick={() => setAdvancedSearch(false)}
              >
                <Icon color="" icon="it-arrow-left-circle" padding={false} />
                {intl.formatMessage(messages.search)}
              </Button>
            )}
            <p className="modal-title-centered h1">
              {intl.formatMessage(
                advancedSearch ? messages.filters : messages.search,
              )}
            </p>
            <Button
              style={{ visibility: advancedSearch ? 'visible' : 'hidden' }}
              color="primary"
              outline
              className="ml-auto"
              title={intl.formatMessage(messages.confirmSearch)}
            >
              {intl.formatMessage(messages.confirmSearch)}
            </Button>
          </div>
        </Container>
      </ModalHeader>
      <ModalBody>
        <Container>
          {!advancedSearch && (
            <>
              <div className="search-filters search-filters-text">
                <div className="form-group">
                  <div className="input-group mb-3">
                    <input
                      id="search-text"
                      type="text"
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="form-control"
                      placeholder={intl.formatMessage(messages.searchLabel)}
                      aria-label={intl.formatMessage(messages.searchLabel)}
                      aria-describedby="search-button"
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-link"
                        type="button"
                        title={intl.formatMessage(messages.search)}
                        id="search-button"
                      >
                        <Icon icon="it-search" aria-hidden={true} size="sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="search-filters search-filters-section">
                <div className="h6">
                  {intl.formatMessage(messages.sections)}
                </div>
                <ButtonToolbar>
                  <Button
                    color="primary"
                    outline={!allSectionsChecked}
                    onClick={resetSections}
                    size="sm"
                    className="mr-2"
                  >
                    {intl.formatMessage(messages.allFilters)}
                  </Button>
                  {Object.keys(sections).map(groupId => (
                    <Button
                      key={groupId}
                      color="primary"
                      outline={!checkedGroups[groupId]}
                      size="sm"
                      className="mr-2"
                      onClick={() =>
                        setGroupChecked(groupId, !checkedGroups[groupId])
                      }
                    >
                      {intl.formatMessage(messages[groupId])}
                    </Button>
                  ))}
                  <Button
                    color="primary"
                    outline
                    size="sm"
                    onClick={() => {
                      setAdvancedTab('sections');
                      setAdvancedSearch(true);
                    }}
                  >
                    ...
                  </Button>
                </ButtonToolbar>
              </div>
              <div className="search-filters search-filters-topics">
                <div className="h6">{intl.formatMessage(messages.topics)}</div>
                <button
                  className={cx('chip chip-simple chip-lg mr-2', {
                    selected: allTopicsChecked,
                  })}
                  type="button"
                  onClick={resetTopics}
                >
                  <span className="chip-label">
                    {intl.formatMessage(messages.allTopics)}
                  </span>
                </button>
                {Object.keys(selectedTopics).map(topicId => (
                  <div
                    role="presentation"
                    className="chip chip-lg selected"
                    key={topicId}
                    onClick={() => setTopicChecked(topicId, false)}
                  >
                    <span className="chip-label">
                      {selectedTopics[topicId].label}
                    </span>
                    <button type="button">
                      <Icon color="" icon="it-close" padding={false} />
                      <span className="sr-only">
                        {intl.formatMessage(messages.removeTopic)}
                      </span>
                    </button>
                  </div>
                ))}
                <button
                  className="chip chip-lg"
                  onClick={() => {
                    setAdvancedTab('topics');
                    setAdvancedSearch(true);
                  }}
                  type="button"
                >
                  <span className="chip-label">...</span>
                </button>
              </div>
              <div className="search-filters search-filters-options">
                <div className="h6">{intl.formatMessage(messages.options)}</div>
                <button
                  className={cx('chip chip-simple chip-lg mr-2', {
                    selected: allOptionsSet,
                  })}
                  type="button"
                  onClick={resetOptions}
                >
                  <span className="chip-label">
                    {intl.formatMessage(messages.allOptions)}
                  </span>
                </button>
                {options.activeContent && (
                  <div
                    role="presentation"
                    className="chip chip-lg selected"
                    onClick={() => setOptionValue('activeContent', false)}
                  >
                    <span className="chip-label">
                      {intl.formatMessage(messages.optionActiveContentButton)}
                    </span>
                    <button type="button">
                      <Icon color="" icon="it-close" padding={false} />
                      <span className="sr-only">
                        {intl.formatMessage(messages.removeOption)}
                      </span>
                    </button>
                  </div>
                )}
                {options.dateStart && (
                  <div
                    role="presentation"
                    className="chip chip-lg selected"
                    onClick={() => setOptionValue('dateStart', null)}
                  >
                    <span className="chip-label">
                      {`${intl.formatMessage(
                        messages.optionDateStartButton,
                      )} ${moment(options.dateStart)
                        .locale(intl.locale)
                        .format('LL')}`}
                    </span>
                    <button type="button">
                      <Icon color="" icon="it-close" padding={false} />
                      <span className="sr-only">
                        {intl.formatMessage(messages.removeOption)}
                      </span>
                    </button>
                  </div>
                )}
                {options.dateEnd && (
                  <div
                    role="presentation"
                    className="chip chip-lg selected"
                    onClick={() => setOptionValue('dateEnd', null)}
                  >
                    <span className="chip-label">
                      {`${intl.formatMessage(
                        messages.optionDateEndButton,
                      )} ${moment(options.dateEnd)
                        .locale(intl.locale)
                        .format('LL')}`}
                    </span>
                    <button type="button">
                      <Icon color="" icon="it-close" padding={false} />
                      <span className="sr-only">
                        {intl.formatMessage(messages.removeOption)}
                      </span>
                    </button>
                  </div>
                )}
                <button
                  className="chip chip-lg"
                  onClick={() => {
                    setAdvancedTab('options');
                    setAdvancedSearch(true);
                  }}
                  type="button"
                >
                  <span className="chip-label">...</span>
                </button>
              </div>
            </>
          )}
          {advancedSearch && (
            <div>
              <Nav tabs className="mb-3 nav-fill">
                <NavItem>
                  <NavLink
                    href="#"
                    active={advancedTab === 'sections'}
                    onClick={() => setAdvancedTab('sections')}
                  >
                    <span>{intl.formatMessage(messages.sections)}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={advancedTab === 'topics'}
                    onClick={() => setAdvancedTab('topics')}
                  >
                    <span>{intl.formatMessage(messages.topics)}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    active={advancedTab === 'options'}
                    onClick={() => setAdvancedTab('options')}
                  >
                    <span>{intl.formatMessage(messages.options)}</span>
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={advancedTab}>
                <TabPane className="p-3" tabId="sections">
                  <Row>
                    <div className="offset-lg-2 col-lg-8 offset-md-1 col-md-10 col-sm-12">
                      <Row>
                        {Object.keys(sections).map(groupId => (
                          <Col sm={6} key={groupId} className="group-col">
                            <FormGroup check tag="div">
                              <Checkbox
                                id={groupId}
                                indeterminate={isGroupIndeterminate(
                                  sections[groupId],
                                  checkedGroups[groupId],
                                )}
                                checked={checkedGroups[groupId]}
                                onChange={e =>
                                  setGroupChecked(
                                    groupId,
                                    e.currentTarget.checked,
                                  )
                                }
                              />
                              <Label
                                check
                                for={groupId}
                                tag="label"
                                className={cx(
                                  'group-head font-weight-bold text-primary',
                                  {
                                    indeterminate: isGroupIndeterminate(
                                      sections[groupId],
                                      checkedGroups[groupId],
                                    ),
                                  },
                                )}
                                widths={['xs', 'sm', 'md', 'lg', 'xl']}
                              >
                                {intl.formatMessage(messages[groupId])}
                              </Label>
                            </FormGroup>

                            {Object.keys(sections[groupId]).map(filterId => (
                              <FormGroup check tag="div" key={filterId}>
                                <Checkbox
                                  id={filterId}
                                  checked={sections[groupId][filterId].value}
                                  onChange={e =>
                                    setSectionFilterChecked(
                                      groupId,
                                      filterId,
                                      e.currentTarget.checked,
                                    )
                                  }
                                />
                                <Label
                                  check
                                  for={filterId}
                                  tag="label"
                                  widths={['xs', 'sm', 'md', 'lg', 'xl']}
                                >
                                  {sections[groupId][filterId].label}
                                </Label>
                              </FormGroup>
                            ))}
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Row>
                </TabPane>
                <TabPane className="p-3" tabId="topics">
                  <Row>
                    <div className="offset-lg-2 col-lg-8 offset-md-1 col-md-10 col-sm-12">
                      <div className="group-col columns">
                        {Object.keys(topics).map(topicId => (
                          <div key={topicId}>
                            <FormGroup check tag="div">
                              <Input
                                id={topicId}
                                type="checkbox"
                                checked={topics[topicId].value}
                                onChange={e =>
                                  setTopicChecked(
                                    topicId,
                                    e.currentTarget.checked,
                                  )
                                }
                              />
                              <Label
                                check
                                for={topicId}
                                tag="label"
                                widths={['xs', 'sm', 'md', 'lg', 'xl']}
                              >
                                {topics[topicId].label}
                              </Label>
                            </FormGroup>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Row>
                </TabPane>
                <TabPane className="p-3" tabId="options">
                  <Row>
                    <div className="offset-lg-2 col-lg-8 offset-md-1 col-md-10 col-sm-12">
                      <FormGroup check className="form-check-group mb-5">
                        <Toggle
                          label={intl.formatMessage(
                            messages.optionActiveContentLabel,
                          )}
                          checked={options.activeContent}
                          onChange={e =>
                            setOptionValue('activeContent', e.target.checked)
                          }
                        />
                        <p className="small">
                          {intl.formatMessage(messages.optionActiveContentInfo)}
                        </p>
                      </FormGroup>
                      <div className="row mt-5">
                        <FormGroup className="col-sm">
                          <Input
                            id="options-date-start"
                            type="date"
                            label={intl.formatMessage(messages.optionDateStart)}
                            placeholder={intl.formatMessage(
                              messages.optionDatePlaceholder,
                            )}
                            value={options.dateStart}
                            onChange={e =>
                              setOptionValue('dateStart', e.target.value)
                            }
                          />
                        </FormGroup>
                        <FormGroup className="col-sm">
                          <Input
                            id="options-date-end"
                            type="date"
                            label={intl.formatMessage(messages.optionDateEnd)}
                            placeholder={intl.formatMessage(
                              messages.optionDatePlaceholder,
                            )}
                            value={options.dateEnd}
                            onChange={e =>
                              setOptionValue('dateEnd', e.target.value)
                            }
                          />
                        </FormGroup>
                      </div>
                    </div>
                  </Row>
                </TabPane>
              </TabContent>
            </div>
          )}
        </Container>
      </ModalBody>
    </Modal>
  );
};

export default injectIntl(SearchModal);