import Medal from '@/components/medal/index.vue';

export default {
  name: 'comment',
  props: {
    msgBody: Object,
  },
  components: { Medal },
  data() {
    return {
      medalColor: this.msgBody.medal?.color,
      medalName: this.msgBody.medal?.name,
      medalLevel: this.msgBody.medal?.level,
      username: this.msgBody.username,
      text: this.msgBody.text,
    };
  },
  methods: {},
};
