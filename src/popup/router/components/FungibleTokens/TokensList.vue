<template>
  <div v-if="filteredResults.length > 0" class="token-list">
    <TokensListItem
      v-bind="$attrs"
      v-for="value in filteredResults"
      :key="value.contract || value.id"
      :tokenData="value"
    />
  </div>
  <div v-else class="tokens-msg">{{ $t('pages.fungible-tokens.no-results') }}</div>
</template>

<script>
import TokensListItem from './TokensListItem';

export default {
  components: {
    TokensListItem,
  },
  props: {
    list: { type: Array, required: true },
    searchTerm: { type: String, default: '' },
  },
  computed: {
    filteredResults() {
      const searchTerm = this.searchTerm.trim().toLowerCase();
      return this.list.filter(
        (token) =>
          !searchTerm ||
          token.symbol.toLowerCase().includes(searchTerm) ||
          token.name.toLowerCase().includes(searchTerm) ||
          token.contract.toLowerCase().includes(searchTerm),
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.token-list .tokens-msg {
  text-align: center;
  margin-top: 15px;
}
</style>
