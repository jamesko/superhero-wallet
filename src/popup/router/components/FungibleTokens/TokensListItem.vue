<template>
  <div
    class="tokens-list-item"
    @click="$router.push({ name: 'token-details', params: { id: tokenData.contract } })"
  >
    <div class="token-name">
      <Avatar
        :address="tokenData.contract !== 'aeternity' ? tokenData.contract : ''"
        :src="tokenData.image || null"
      />
      <span>{{ tokenData.symbol }}</span>
    </div>
    <div class="details">
      <TokenAmount :amount="+tokenData.convertedBalance || 0" :symbol="tokenData.symbol" />
      <AddToFavourites
        v-if="isFavourites"
        :class="{ active: favouriteTokens.includes(tokenData.contract) }"
        @click.stop="toggleFavouriteToken(tokenData.contract)"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import Avatar from '../Avatar';
import TokenAmount from '../TokenAmount';
import AddToFavourites from '../../../../icons/add-to-favourites.svg?vue-component';

export default {
  components: { Avatar, TokenAmount, AddToFavourites },
  props: {
    tokenData: { type: Object, required: true },
    isFavourites: { type: Boolean },
  },
  computed: mapState('fungibleTokens', ['favouriteTokens']),
  methods: mapMutations('fungibleTokens', ['toggleFavouriteToken']),
};
</script>

<style lang="scss" scoped>
@import '../../../../styles/typography';

.tokens-list-item {
  background-color: $color-bg-1;
  margin-bottom: 1px;
  height: 48px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 4px;
  cursor: pointer;

  @extend %face-sans-14-medium;
  line-height: 24px;

  &:hover {
    background-color: $color-hover;

    .details svg {
      color: $color-light-grey;
    }
  }

  &:first-child {
    margin-top: 1px;
  }

  .token-name {
    span {
      color: $color-blue;
    }

    .avatar {
      width: 32px;
      height: 32px;
      margin: 4px;
    }
  }

  > div {
    display: flex;
    align-items: center;
  }

  .details svg {
    width: 24px;
    height: 24px;
    color: $color-dark-grey;

    &.active {
      color: $color-green;
    }
  }
}
</style>
