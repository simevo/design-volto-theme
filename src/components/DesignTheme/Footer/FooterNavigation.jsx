/**
 * FooterNavigation components.
 * @module components/DesignTheme/Footer/FooterNavigation
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { defineMessages, useIntl } from 'react-intl';
import { isEqual } from 'lodash';
import { getBaseUrl } from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import {
  Row,
  Col,
  LinkList,
  LinkListItem,
} from 'design-react-kit/dist/design-react-kit';

const messages = defineMessages({
  goToPage: {
    id: 'Vai alla pagina',
    defaultMessage: 'Vai alla pagina',
  },
});

const FooterNavigation = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const items = useSelector(state => state.navigation.items, isEqual);

  useEffect(() => {
    dispatch(getNavigation(getBaseUrl(''), 2));
  }, [dispatch]);

  return (
    <>
      {items && (
        <Row tag="div">
          {items.map(item => (
            <Col
              lg={3}
              md={3}
              sm={6}
              className="pb-2"
              widths={['xs', 'sm', 'md', 'lg', 'xl']}
              key={item.url}
            >
              <h4>
                <Link
                  to={item.url}
                  title={
                    intl.formatMessage(messages.goToPage) + ': ' + item.title
                  }
                >
                  {item.title}
                </Link>
              </h4>
              {item.items && (
                <LinkList className="footer-list clearfix" tag="div">
                  {item.items.map(subitem => (
                    <LinkListItem
                      key={subitem.url}
                      to={subitem.url}
                      tag={Link}
                      title={
                        intl.formatMessage(messages.goToPage) +
                        ': ' +
                        subitem.title
                      }
                    >
                      {subitem.title}
                    </LinkListItem>
                  ))}
                </LinkList>
              )}
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default FooterNavigation;
