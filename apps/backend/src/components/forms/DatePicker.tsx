export {};
// https://github.com/chrisbull/react-chakra-date-picker
// import React from 'react'
// import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
// import locale from "date-fns/locale/en-GB";
// import DateFnsUtils from '@date-io/date-fns';

// import { Controller, useFormContext } from 'react-hook-form'

// import { getFirstAvailableCollectionDate } from '~/helpers/reconomeFormHelpers'
// import { isBefore } from 'date-fns'

// const ReconomeFieldDatePicker = ({name, label, isSmall }) => {
//   const { control, errors } = useFormContext()

//   let firstAvailableDate = getFirstAvailableCollectionDate(isSmall)
  
//   const error =
//     errors.hasOwnProperty(name) &&
//     errors[name].message;

//   return (
//     <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
//       <Controller
//         // as={
//         //   <DatePicker required />
//         // }
//         render={(props) => (
//           <DatePicker
//             required
//             value={props.value}
//             onChange={props.onChange}
//             //ref={props.ref}
//             name={name}
//             disablePast
//             disableToolbar
//             autoOk
//             variant="inline"
//             format="dd/MM/yyyy"
//             inputVariant="outlined"
//             label={label}
//             key={`key-${name}`}
//             error={!!error}
//             helperText={error}
//             shouldDisableDate={(day) => {
//               let testDate = new Date(day.toDateString()) // remove the time part of the date and reconvert it to a date
              
//               if (testDate.getDay() === 0 || testDate.getDay() === 6)
//                 return true

//               if (isBefore(testDate, firstAvailableDate))
//                 return true

//               return false
//             }}
//           />
//         )}
//         control={control}
//         name={name}
//         // disablePast
//         // disableToolbar
//         // autoOk
//         // variant="inline"
//         // format="dd/MM/yyyy"
//         // inputVariant="outlined"
//         // label={label}
//         // key={`key-${name}`}
//         // error={!!error}
//         // helperText={error}
//         // shouldDisableDate={(day) => {
//         //   let testDate = new Date(day.toDateString()) // remove the time part of the date and reconvert it to a date
          
//         //   if (testDate.getDay() === 0 || testDate.getDay() === 6)
//         //     return true

//         //   if (isBefore(testDate, firstAvailableDate))
//         //     return true

//         //   return false
//         // }}
//         // rules={{
//         //   required: "Please choose a collection date",
//         // }}
//       />
//     </MuiPickersUtilsProvider>
//   )
// }

// export default ReconomeFieldDatePicker