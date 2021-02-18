<template>
  <div class="tokens-preview">
    <div class="menu">
      <div class="tabs">
        <button
          @click="goTo('balances', $t('pages.fungible-tokens.balances-title'))"
          :class="{ active: activeTab === 'balances' }"
        >
          <Balances />
          <span>{{ $t('pages.fungible-tokens.balances') }}</span>
        </button>
        <button
          @click="goTo('all', $t('pages.fungible-tokens.all'))"
          :class="{ active: activeTab === 'all' }"
        >
          <Balances />
          <span>{{ $t('pages.fungible-tokens.all') }}</span>
        </button>
        <button
          @click="goTo('favourites', $t('pages.fungible-tokens.favourites'))"
          :class="{ active: activeTab === 'favourites' }"
        >
          <AddToFavourites />
          <span>{{ $t('pages.fungible-tokens.favourites') }}</span>
        </button>
        <button v-show="!search" @click="search = true">
          <Search />
        </button>
      </div>
      <div v-show="!search && activeTab !== 'balances'" class="filters">
        <button @click="sortingBy = ''" :class="{ active: sortingBy === '' }">
          <span>{{ $t('pages.fungible-tokens.name') }}</span>
          <Sort />
        </button>
        <button @click="sortingBy = 'price'" :class="{ active: sortingBy === 'price' }">
          <span>{{ $t('pages.fungible-tokens.price') }}</span>
          <Sort class="rotated" />
        </button>
        <button>
          <span>{{ $t('pages.fungible-tokens.recent') }}</span>
          <Filters />
        </button>
        <button>
          <span>{{ $t('pages.fungible-tokens.trending') }}</span>
          <Filters />
        </button>
      </div>
      <div v-show="search" class="search">
        <input
          v-model="searchTerm"
          :placeholder="$t('pages.fungible-tokens.searchPlaceholder')"
          type="text"
        />
        <button @click="clearAndClose">
          <Close />
        </button>
      </div>
      <div v-show="activeTab === 'balances' && !search" class="account-balance">
        <Avatar :address="account.address" />
        <span>{{ `≈${formatCurrency(balanceCurrency)}` }}</span>
      </div>
    </div>
    <TokensList
      :is-favourites="activeTab !== 'balances'"
      :list="tokenList"
      :searchTerm="searchTerm"
    />
  </div>
</template>

<script>
import { pick } from 'lodash-es';
import { mapState, mapGetters } from 'vuex';
import TokensList from '../../components/FungibleTokens/TokensList';
import Avatar from '../../components/Avatar';
import Balances from '../../../../icons/balances.svg?vue-component';
import AddToFavourites from '../../../../icons/add-to-favourites.svg?vue-component';
import Sort from '../../../../icons/sort.svg?vue-component';
import Filters from '../../../../icons/filters.svg?vue-component';
import Search from '../../../../icons/search.svg?vue-component';
import Close from '../../../../icons/close.svg?vue-component';

export default {
  components: {
    Balances,
    AddToFavourites,
    Sort,
    Filters,
    Search,
    Close,
    TokensList,
    Avatar,
  },
  data() {
    return {
      search: false,
      searchTerm: '',
      activeTab: 'all',
      sortingBy: '',
    };
  },
  subscriptions() {
    return pick(this.$store.state.observables, ['balance', 'balanceCurrency']);
  },
  computed: {
    ...mapState('fungibleTokens', [
      'tokenBalances',
      'availableTokens',
      'aePublicData',
      'favouriteTokens',
    ]),
    ...mapGetters(['account']),

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
        ...(this.activeTab === 'balances' ? this.tokenBalances : this.tokenInfo),
      ]
        .sort((a, b) => {
          switch (this.sortingBy) {
            case 'price':
              return a.current_price > b.current_price;
            default:
              return 1;
          }
        })
        .filter((t) =>
          this.activeTab === 'favourites' ? this.favouriteTokens.includes(t.contract) : true,
        );
    },
  },
  methods: {
    clearAndClose() {
      this.searchTerm = '';
      this.search = false;
    },
    goTo(tab, title) {
      this.activeTab = tab;
      this.$store.commit('setPageTitle', title);
    },
  },
  destroyed() {
    this.$store.commit('setPageTitle', '');
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/typography';

.tokens-preview {
  .menu {
    position: fixed;
    width: 100%;
    background-color: $color-bg-3;

    .tabs,
    .filters {
      display: flex;
      padding: 8px;
      color: $color-light-grey;
      border: 1px solid $color-black;
      border-radius: 0 0 4px 4px;

      > button {
        display: flex;
        align-items: center;
      }
    }

    .tabs {
      > button {
        border-radius: 20px;
        padding: 8px;
        margin-right: 8px;

        @extend %face-sans-16-medium;

        &:last-of-type {
          margin-right: 0;
          margin-left: auto;

          svg:hover {
            color: $color-green;
            opacity: 1;
            cursor: pointer;
          }
        }

        &:hover:not(:last-of-type):not(.active) {
          background-color: $color-hover;
          color: $color-white;
          transition: all 0.12s ease-in-out;
          cursor: pointer;

          svg {
            opacity: 1;
          }
        }

        &.active {
          color: $color-green;

          svg {
            color: inherit;
            opacity: 1;
          }
        }

        span {
          margin-left: 4px;
        }

        svg {
          color: $color-white;
          opacity: 0.7;
          width: 24px;
          height: 24px;
        }
      }
    }

    .filters {
      padding-left: 16px;
      padding-right: 14px;

      button {
        @extend %face-sans-15-medium;

        padding: 0;
        line-height: 24px;
        margin-right: 24px;

        &:last-of-type {
          margin-right: 0;
        }

        &:hover {
          color: $color-light-grey;
          transition: all 0.12s ease-in-out;
          cursor: pointer;

          svg {
            color: $color-green;
          }
        }

        &.active {
          color: $color-green;
        }

        span {
          margin-right: 2px;
        }

        svg {
          color: $color-white;
          width: 16px;
          height: 16px;

          &.rotated {
            transform: rotate(180deg);
          }
        }
      }
    }

    .search {
      display: flex;
      align-items: center;
      border-radius: 6px;
      border-top: 1px solid transparent;
      border-bottom: 1px solid transparent;

      &:focus-within {
        border-color: $color-blue;
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
        }

        ~ * {
          margin-right: 15px;
        }
      }

      button {
        width: 30px;
        height: 30px;
        align-items: center;
        display: flex;
        border-radius: 16px;

        &:hover {
          background-color: $color-hover;
          cursor: pointer;

          svg {
            opacity: 1;
          }
        }

        svg {
          color: $color-white;
          width: 18px;
          height: 18px;
          opacity: 0.44;
        }
      }
    }

    .account-balance {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: rgba(17, 97, 254, 0.15);
      border-radius: 4px;

      @extend %face-sans-20-regular;

      .avatar {
        width: 32px;
        height: 32px;
      }
    }
  }

  .token-list {
    padding-top: 100px;
  }
}
</style>
