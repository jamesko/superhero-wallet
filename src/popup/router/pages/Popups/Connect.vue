<template>
  <div
    class="connect popup-aex2"
    data-cy="popup-aex2"
  >
    <Overview
      title="Allow access"
      :sender="{ name: app.name, address: app.host, url: app.host }"
      :recipient="account"
    />

    <div class="summary">
      <span class="app-name">{{ app.name }}</span>
      ({{ app.host }}) {{ $t('pages.connectConfirm.websiteRequestconnect') }}
    </div>

    <div class="permissions">
      <span class="title">
        <CheckMark class="icon" /> {{ $t('pages.connectConfirm.addressLabel') }}
      </span>
      <span class="description">
        {{ $t('pages.connectConfirm.addressRequest') }}
      </span>

      <span class="title">
        <CheckMark class="icon" /> {{ $t('pages.connectConfirm.transactionLabel') }}
      </span>
      <span class="description">
        {{ $t('pages.connectConfirm.transactionRequest') }}
      </span>
    </div>

    <div class="button-fixed">
      <Button
        half
        fill="secondary"
        data-cy="deny"
        @click="cancel"
      >
        {{ $t('pages.connectConfirm.cancelButton') }}
      </Button>
      <Button
        half
        data-cy="accept"
        @click="resolve()"
      >
        {{ $t('pages.connectConfirm.confirmButton') }}
      </Button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Button from '../../components/Button';
import Overview from '../../components/Overview';
import CheckMark from '../../../../icons/check-mark.svg?vue-component';
import mixin from './mixin';

export default {
  components: {
    Overview,
    Button,
    CheckMark,
  },
  mixins: [mixin],
  computed: {
    ...mapGetters(['getExplorerPath']),
    ...mapState({
      account(_, { account }) {
        return {
          ...account,
          label: this.$t('transaction.overview.accountAddress'),
          url: this.getExplorerPath(account.address),
        };
      },
    }),
  },
};
</script>

<style lang="scss" src="./AexPopup.scss" scoped />

<style lang="scss" scoped>
@use '../../../../styles/variables';
@use '../../../../styles/typography';

.connect {
  .summary {
    padding: 16px;

    @extend %face-sans-15-medium;

    color: variables.$color-light-grey;

    .app-name {
      color: variables.$color-white;
    }
  }

  .permissions {
    padding: 0 16px;;

    .title {
      display: flex;
      align-items: center;
      padding-bottom: 4px;

      @extend %face-sans-15-medium;

      color: variables.$color-dark-grey;

      .icon {
        width: 24px;
        height: 24px;
        color: variables.$color-green;
        padding-right: 4px;
      }
    }

    .description {
      display: block;
      padding-bottom: 16px;

      @extend %face-sans-15-regular;

      color: variables.$color-white;
      text-align: left;
    }
  }
}
</style>
