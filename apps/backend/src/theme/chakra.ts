export const chakraTheme = {
  styles: {
    global: {
      "html, body": {
        color: "gray.900",
        lineHeight: "tall",
        margin: 0,
        padding: 0,
        minHeight: "100%",
        height: "100%",
      },
      "#root": {
        height: "100%",
      },
      body: {
        minHeight: "100%",
        bgGradient: "linear(45deg, rgb(222,240,244), rgb(148,187,233)) fixed",
        bgAttachment: "fixed",
      },
      a: {
        color: "teal.500",
      },
    },
    
  },

  layerStyles: {
    pageContainer: {
      bg: "gray.100",
      border: "1px dashed gray.200",
      borderRadius: "10px",
      borderColor: "#ff0",
      boxShadow: '1px 1px 2px 0px rgba(0,0,0,0.10)'
    },
  },
  textStyles: {
    h1: {
      // you can also use responsive styles
      fontSize: ["48px", "72px"],
      fontWeight: "bold",
      lineHeight: "110%",
      letterSpacing: "-2%",
    },
    h2: {
      fontSize: ["36px", "48px"],
      fontWeight: "semibold",
      lineHeight: "110%",
      letterSpacing: "-1%",
    },
  },
};

export default chakraTheme;
