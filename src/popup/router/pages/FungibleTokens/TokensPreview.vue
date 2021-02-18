<template>
  <div class="tokens-preview">
    <div class="menu">
      <a class="menu-item" :class="{ active: activeItem === 'tokens' }">
        <TokenPiles />
        {{ $t('pages.fungible-tokens.tokens') }}
      </a>
    </div>
    <div class="search">
      <input
        v-model="searchTerm"
        :placeholder="$t('pages.fungible-tokens.searchPlaceholder')"
        type="text"
      />
      <Eraser v-if="searchTerm.length > 0" class="eracer-icon" @click="searchTerm = ''" />
      <Search v-else class="search-icon" />
    </div>
    <TabsMenu v-model="activeTab" :tabOptions="tabs" />
    <TokensList is-favourites :list="tokenList" :searchTerm="searchTerm" />
  </div>
</template>

<script>
import { pick } from 'lodash-es';
import { mapState } from 'vuex';
import TabsMenu from '../../components/TabsMenu';
import TokensList from '../../components/FungibleTokens/TokensList';
import TokenPiles from '../../../../icons/token-piles.svg?vue-component';
import Search from '../../../../icons/search.svg?vue-component';
import Eraser from '../../../../icons/eraser.svg?vue-component';

export default {
  name: 'fungible-tokens',
  components: {
    TokenPiles,
    Search,
    Eraser,
    TabsMenu,
    TokensList,
  },
  data() {
    return {
      activeItem: 'tokens',
      searchTerm: '',
      activeTab: 'all',
      tabs: [
        {
          name: 'all',
          text: this.$t('pages.fungible-tokens.all'),
        },
        {
          name: 'my-tokens',
          text: this.$t('pages.fungible-tokens.myTokens'),
        },
      ],
    };
  },
  subscriptions() {
    return pick(this.$store.state.observables, ['balance', 'balanceCurrency']);
  },
  computed: {
    ...mapState('fungibleTokens', ['tokenBalances', 'availableTokens', 'aePublicData']),

    /**
     * Returns the default aeternity meta information
     */
    aeternityToken() {
      return this.aePublicData && Object.keys(this.aePublicData).length > 0
        ? [
            {
              ...this.aePublicData,
              convertedBalance: this.balance,
              symbol: 'AE',
              balanceCurrency: this.balanceCurrency,
              contract: 'aeternity',
            },
          ]
        : [];
    },
    /**
     * Converts the token information object into a searchable list
     */
    tokenInfo() {
      return Object.entries(this.availableTokens).map(([contract, tokenData]) => ({
        name: tokenData.name,
        symbol: tokenData.symbol,
        contract,
        decimals: tokenData.decimals,
        convertedBalance: tokenData.convertedBalance,
      }));
    },
    tokenList() {
      return [
        ...this.aeternityToken,
        ...(this.activeTab === this.tabs[1].name ? this.tokenBalances : this.tokenInfo),
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/variables';

.menu {
  margin-top: 3px;
  padding: 7px;
  background-color: $black-2;
}

.menu-item {
  color: $gray-2;
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 500;
  display: inline-block;
  border-radius: 20px;
  text-decoration: none;

  svg {
    margin-right: 5px;
    vertical-align: sub;
  }

  &.active {
    color: $accent-color;
    background-color: $black-3;
  }
}

.search {
  display: flex;
  align-items: center;
  border: 1px solid transparent;

  &:focus-within {
    border-color: $secondary-color;
  }

  input {
    font-size: 14px;
    color: $white-1;
    height: 40px;
    padding: 0 15px;
    flex-grow: 1;

    &::placeholder {
      color: $gray-2;
    }

    &:focus {
      outline: none;
      border: none;

      ~ .search-icon {
        display: none;
      }
    }

    ~ * {
      margin-right: 15px;
    }
  }

  .search-icon {
    color: $accent-color;
  }

  .eracer-icon :hover {
    cursor: pointer;
  }
}
</style>
