/**
 * View image block.
 * @module components/manage/Blocks/Hero/View
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import redraft from 'redraft';
import { Container, Row, Col } from 'react-bootstrap';
import { isCmsUi } from '@plone/volto/helpers';
import { settings } from '~/config';

/**
 * View image block class.
 * @class View
 * @extends Component
 */
const View = ({ data, pathname }) => {
  if (__SERVER__) {
    return <div />;
  }
  const isCmsUI = pathname ? isCmsUi(pathname) : false;
  const generateKey = pre => {
    pre = pre ? pre : '';
    return pre + Math.random(5);
  };
  return (
    <section className="alertblock" key={generateKey('alert')}>
      <Row className={cx('row-full-width', 'bg-' + data.color)}>
        <Container className="p-4 pt-5 pb-5">
          <Col>
            {redraft(
              data.text,
              settings.ToHTMLRenderers,
              settings.ToHTMLOptions,
            )}
          </Col>
        </Container>
      </Row>
    </section>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
View.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default React.memo(View);
