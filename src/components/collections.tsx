import * as React from "react";
import { connect, Dispatchers } from "./connect";

import urls from "../constants/urls";
import { actionCreatorsList } from "../actions";

import { FiltersContainer } from "./filters-container";

import { IMeatProps } from "./meats/types";

import CollectionsGrid from "./collections-grid/grid";
import Link from "./basics/link";
import Filler from "./basics/filler";
import TitleBar from "./title-bar";

import styled, * as styles from "./styles";
import { injectIntl, InjectedIntl } from "react-intl";

const CollectionsContainer = styled.div`${styles.meat()};`;

const tab = "collections";

export class Collections extends React.PureComponent<IProps & IDerivedProps> {
  render() {
    const { intl, navigate } = this.props;

    return (
      <CollectionsContainer>
        <TitleBar tab={tab} />
        <FiltersContainer>
          <Link
            label={intl.formatMessage({ id: "outlinks.manage_collections" })}
            onClick={e => navigate({ tab: `url/${urls.myCollections}` })}
          />
          <Filler />
        </FiltersContainer>
        <CollectionsGrid />
      </CollectionsContainer>
    );
  }
}

interface IProps extends IMeatProps {}

const actionCreators = actionCreatorsList("navigate");

type IDerivedProps = Dispatchers<typeof actionCreators> & {
  intl: InjectedIntl;
};

export default connect<IProps>(injectIntl(Collections), { actionCreators });
