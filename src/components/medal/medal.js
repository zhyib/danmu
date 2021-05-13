export default {
  name: 'medal',
  props: {
    color: String,
    name: String,
    level: Number,
  },
  data() {
    return {
      medalBorder: {
        border: `2px solid ${this.color}`,
        'background-color': `${this.color}`,
      },
      medalColor: {
        'background-color': `${this.color}`,
      },
      textColor: {
        color: `${this.color}`,
      },
    };
  },
  methods: {
  },
};
