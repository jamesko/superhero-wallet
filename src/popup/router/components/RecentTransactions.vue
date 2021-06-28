<template>
  <div
    class="recent-transactions"
    :class="{ 'tour-bar': tourStartBar }"
  >
    <div class="header">
      <span class="title">{{ $t('pages.recentTransactions.title') }}</span>
      <router-link
        v-if="transactions.latest.length || transactions.pending.length"
        to="/transactions"
        data-cy="view-all-transactions"
        class="view-all"
      >
        {{ $t('pages.recentTransactions.viewAll') }} <TxHistory class="icon" />
      </router-link>
    </div>
    <TransactionList
      :display-filter="false"
      :max-length="6"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import TxHistory from '../../../icons/tx-history.svg?vue-component';
import TransactionList from './TransactionList';

export default {
  components: {
    TransactionList,
    TxHistory,
  },
  computed: mapState(['tourStartBar', 'transactions']),
};
</script>

<style lang="scss" scoped>
@use '../../../styles/variables';
@use '../../../styles/typography';
@use '../../../styles/mixins';

.recent-transactions {
  background: variables.$color-bg-3;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;

  .header {
    height: 48px;
    position: fixed;
    width: 100%;
    padding: 8px 16px 8px 16px;
    background: variables.$color-bg-2;
    border-radius: 0 0 4px 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    @include mixins.desktop {
      width: variables.$extension-width;
    }

    .title {
      @extend %face-sans-15-medium;

      color: variables.$color-dark-grey;
    }

    .view-all {
      display: flex;
      padding: 4px 8px;
      border-radius: 16px;
      background: variables.$color-bg-1;
      text-decoration: none;
      color: variables.$color-dark-grey;
      transition: all 0.12s ease-out;

      @extend %face-sans-15-medium;

      .icon {
        margin-left: 4px;
        width: 24px;
        color: variables.$color-white;
        opacity: 0.7;
      }

      &:hover {
        color: variables.$color-green;
        background: rgba(0, 255, 157, 0.1);

        .icon {
          opacity: 1;
          color: variables.$color-green-hover;
        }
      }
    }
  }

  .transaction-list {
    flex-grow: 1;
  }
}
</style>
