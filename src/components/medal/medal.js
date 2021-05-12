export default {
  name: 'medal',
  props: {
    color: Number,
    name: String,
    level: Number,
  },
  data() {
    return {
      medalBorder: {
        border: `1px solid ${this.hexColor()}`,
      },
      medalColor: {
        'background-color': `${this.hexColor()}`,
      },
      textColor: {
        color: `${this.hexColor()}`,
      },
    };
  },
  methods: {
    hexColor() {
      return `#${this.color.toString(16)}`;
    },
  },
};
